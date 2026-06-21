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

    /// <summary>Все задачи КТ для текущего студента (включая те, по которым нет submission).</summary>
    [HttpGet("tasks")]
    public async Task<IActionResult> GetAllKtTasks(Guid activityId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();

        // All task items for this activity (from any task set)
        var taskItems = await _db.TaskSets
            .AsNoTracking()
            .Where(ts => ts.ActivityId == activityId)
            .SelectMany(ts => ts.Tasks.Select(t => new { TaskItemId = t.Id, TaskCode = t.Code }))
            .ToListAsync(ct);

        if (taskItems.Count == 0) return Ok(Array.Empty<object>());

        var taskIds = taskItems.Select(t => t.TaskItemId).ToList();

        // Student's existing submissions
        var subs = await _db.TaskSubmissions
            .AsNoTracking()
            .Where(s => s.ActivityId == activityId && s.StudentId == uid.Value && taskIds.Contains(s.TaskItemId))
            .ToListAsync(ct);

        // All queue slots for position calc
        var queueSlots = await _db.TaskSubmissions
            .AsNoTracking()
            .Where(s => s.ActivityId == activityId
                && taskIds.Contains(s.TaskItemId)
                && (s.Status == SubmissionStatus.ReadyForReview || s.Status == SubmissionStatus.InReview))
            .Select(s => new { s.TaskItemId, s.ReadyAt })
            .ToListAsync(ct);

        var subDict = subs.ToDictionary(s => s.TaskItemId);

        var result = taskItems.Select(t =>
        {
            subDict.TryGetValue(t.TaskItemId, out var sub);
            int queuePos = 0;
            if (sub != null && sub.Status == SubmissionStatus.ReadyForReview)
                queuePos = queueSlots.Count(q => q.TaskItemId == t.TaskItemId && q.ReadyAt < sub.ReadyAt) + 1;

            return (object)new
            {
                taskItemId = t.TaskItemId,
                taskCode = t.TaskCode,
                status = sub?.Status.ToString() ?? "Draft",
                queuePosition = queuePos,
                solutionUrl = sub?.SolutionUrl
            };
        }).ToList();

        return Ok(result);
    }

    /// <summary>Условия КТ (ссылка) и статус занятия — для студента.</summary>
    [HttpGet("info")]
    public async Task<IActionResult> GetKtInfo(Guid activityId, CancellationToken ct)
    {
        var a = await _db.Activities.AsNoTracking()
            .Where(x => x.Id == activityId)
            .Select(x => new { x.Title, x.TaskFileUrl, x.Status })
            .FirstOrDefaultAsync(ct);
        if (a is null) return NotFound();
        return Ok(new { title = a.Title, conditionsUrl = a.TaskFileUrl, status = a.Status.ToString() });
    }

    /// <summary>Полная сводка КТ для ассистента/преподавателя: задачи и по каждой — кто отметил готовность,
    /// время, статус и присланное решение (#6).</summary>
    [HttpGet("overview")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> Overview(Guid activityId, CancellationToken ct)
    {
        var taskItems = await _db.TaskSets
            .AsNoTracking()
            .Where(ts => ts.ActivityId == activityId)
            .SelectMany(ts => ts.Tasks.Select(t => new { TaskItemId = t.Id, t.Code }))
            .ToListAsync(ct);
        if (taskItems.Count == 0) return Ok(Array.Empty<object>());

        var taskIds = taskItems.Select(t => t.TaskItemId).ToList();

        var subs = await _db.TaskSubmissions
            .AsNoTracking()
            .Where(s => s.ActivityId == activityId && taskIds.Contains(s.TaskItemId) && s.StudentId != null)
            .Join(_db.Users, s => s.StudentId, u => u.Id, (s, u) => new {
                s.Id, s.TaskItemId, studentName = u.DisplayName,
                status = s.Status.ToString(), s.ReadyAt, s.SolutionUrl, s.Result01
            })
            .ToListAsync(ct);

        var result = taskItems
            .OrderBy(t => int.TryParse(t.Code, out var n) ? n : int.MaxValue)
            .Select(t => (object)new {
                taskItemId = t.TaskItemId,
                taskCode = t.Code,
                submissions = subs
                    .Where(s => s.TaskItemId == t.TaskItemId)
                    .OrderBy(s => s.ReadyAt ?? DateTimeOffset.MaxValue)
                    .Select(s => new {
                        submissionId = s.Id,
                        studentName = s.studentName,
                        status = s.status,
                        readyAt = s.ReadyAt,
                        solutionUrl = s.SolutionUrl,
                        result01 = s.Result01
                    })
                    .ToList()
            })
            .ToList();

        return Ok(result);
    }

    public sealed record KtCompleteDto(bool Accepted, int Result01, decimal? DefenderCoefficient);
    public sealed record SolutionDto(string Url);
}
