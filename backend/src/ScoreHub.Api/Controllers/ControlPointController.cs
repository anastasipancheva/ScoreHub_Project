using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreHub.Application.Abstractions;
using ScoreHub.Domain.Auth;
using ScoreHub.Domain.Entities;
using ScoreHub.Domain.Enums;
using ScoreHub.Infrastructure.Persistence;

namespace ScoreHub.Api.Controllers;

/// <summary>Контрольная точка (КТ): индивидуальная готовность, очередь по задаче, вызов и приём.</summary>
/// <remarks>Очередь по задаче упорядочена по ReadyAt. Нельзя вызвать студента на вторую задачу, пока он InReview по другой.</remarks>
[ApiController]
[Route("api/activities/{activityId:guid}/kt")]
[Authorize]
public sealed class ControlPointController : ApiControllerBase
{
    private readonly IControlPointService _kt;
    private readonly ScoreHubDbContext _db;

    public ControlPointController(IControlPointService kt, ScoreHubDbContext db)
    {
        _kt = kt;
        _db = db;
    }

    /// <summary>Студент отмечает готовность сдать конкретную задачу КТ (фиксируется время для очереди).</summary>
    [HttpPost("tasks/{taskItemId:guid}/ready")]
    public async Task<IActionResult> MarkReady(Guid activityId, Guid taskItemId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _kt.MarkTaskReady(uid.Value, activityId, taskItemId, ct);
        return r.IsOk ? Ok() : BadRequest(new { error = r.Error });
    }

    /// <summary>Сводка по своим задачам на этой КТ: статус и примерная позиция в очереди.</summary>
    [HttpGet("my-queue")]
    public async Task<IActionResult> MyQueue(Guid activityId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _kt.GetMyQueue(uid.Value, activityId, ct);
        return r.IsOk ? Ok(r.Value) : BadRequest(new { error = r.Error });
    }

    /// <summary>Очередь по одной задаче КТ для ассистента (закреплённого за задачей) или преподавателя.</summary>
    [HttpGet("tasks/{taskItemId:guid}/queue")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> Queue(Guid activityId, Guid taskItemId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _kt.GetQueueForTask(uid.Value, activityId, taskItemId, ct);
        return r.IsOk ? Ok(r.Value) : BadRequest(new { error = r.Error });
    }

    /// <summary>Вызвать следующего в очереди на сдачу этой задачи (статус InReview, уведомление студенту).</summary>
    [HttpPost("tasks/{taskItemId:guid}/call-next")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> CallNext(Guid activityId, Guid taskItemId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _kt.CallNextStudent(uid.Value, activityId, taskItemId, ct);
        return r.IsOk ? Ok() : BadRequest(new { error = r.Error });
    }

    /// <summary>Завершить индивидуальный приём КТ по submissionId (accepted, result01, defenderCoefficient).</summary>
    /// <remarks>Параметр activityId в маршруте зарезервирован для симметрии URL; проверка привязки к занятию внутри сервиса.</remarks>
    [HttpPost("submissions/{submissionId:guid}/review/complete")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> CompleteReview(
        Guid activityId,
        Guid submissionId,
        [FromBody] KtCompleteDto dto,
        CancellationToken ct)
    {
        _ = activityId;
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _kt.CompleteKtReview(
            uid.Value,
            submissionId,
            dto.Accepted,
            dto.Result01,
            dto.DefenderCoefficient,
            ct);
        return r.IsOk ? Ok() : BadRequest(new { error = r.Error });
    }

    /// <summary>Студент покидает очередь по задаче (снимает готовность).</summary>
    [HttpDelete("tasks/{taskItemId:guid}/ready")]
    public async Task<IActionResult> UnmarkReady(Guid activityId, Guid taskItemId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();

        var sub = await _db.TaskSubmissions
            .FirstOrDefaultAsync(s => s.ActivityId == activityId
                && s.TaskItemId == taskItemId
                && s.StudentId == uid.Value
                && s.Status == SubmissionStatus.ReadyForReview, ct);

        if (sub is null) return NotFound();
        _db.TaskSubmissions.Remove(sub);
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    /// <summary>Студент сохраняет ссылку на решение (Google Drive).</summary>
    [HttpPatch("tasks/{taskItemId:guid}/solution")]
    public async Task<IActionResult> SetSolution(Guid activityId, Guid taskItemId, [FromBody] SolutionDto dto, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();

        var sub = await _db.TaskSubmissions
            .FirstOrDefaultAsync(s => s.ActivityId == activityId
                && s.TaskItemId == taskItemId
                && s.StudentId == uid.Value, ct);

        if (sub is null)
        {
            sub = new TaskSubmission {
                Id = Guid.NewGuid(),
                ActivityId = activityId,
                TaskItemId = taskItemId,
                StudentId = uid.Value,
                SolutionUrl = dto.Url,
                Status = SubmissionStatus.Draft
            };
            _db.TaskSubmissions.Add(sub);
        }
        else
        {
            sub.SolutionUrl = dto.Url;
        }
        await _db.SaveChangesAsync(ct);
        return Ok();
    }

    /// <summary>Ассистент просматривает решения студентов по задаче.</summary>
    [HttpGet("tasks/{taskItemId:guid}/submissions")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> GetSubmissions(Guid activityId, Guid taskItemId, CancellationToken ct)
    {
        var subs = await _db.TaskSubmissions
            .AsNoTracking()
            .Where(s => s.ActivityId == activityId && s.TaskItemId == taskItemId && s.StudentId != null)
            .Select(s => new {
                s.Id,
                s.StudentId,
                s.SolutionUrl,
                s.Status,
                s.ReadyAt,
                s.Result01
            })
            .ToListAsync(ct);
        return Ok(subs);
    }

    public sealed record KtCompleteDto(bool Accepted, int Result01, decimal? DefenderCoefficient);
    public sealed record SolutionDto(string Url);
}
