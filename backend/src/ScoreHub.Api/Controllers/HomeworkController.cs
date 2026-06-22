using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreHub.Application.Abstractions;
using ScoreHub.Domain.Auth;
using ScoreHub.Domain.Enums;
using ScoreHub.Infrastructure.Persistence;

namespace ScoreHub.Api.Controllers;

/// <summary>Дорешка: сдача задач лекций текущего модуля и домашек, очередь с приоритетами, приём ассистентом.</summary>
[ApiController]
[Route("api")]
[Authorize]
public sealed class HomeworkController : ApiControllerBase
{
    private readonly IHomeworkService _svc;
    private readonly ScoreHubDbContext _db;
    public HomeworkController(IHomeworkService svc, ScoreHubDbContext db) { _svc = svc; _db = db; }

    /// <summary>Данные для страницы Дорешки студента: источники задач (домашки пары + задачи лекций модуля) и мои сдачи.</summary>
    [HttpGet("activities/{activityId:guid}/doreshka")]
    public async Task<IActionResult> Doreshka(Guid activityId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();

        var session = await _db.Activities.AsNoTracking()
            .Where(a => a.Id == activityId)
            .Select(a => new { a.Title, a.ModuleId })
            .FirstOrDefaultAsync(ct);
        if (session is null) return NotFound(new { error = "Занятие не найдено." });

        // Домашки самой пары (её собственные задачи).
        var homeworkTasks = await _db.TaskItems.AsNoTracking()
            .Where(t => t.TaskSet.ActivityId == activityId)
            .Select(t => new { taskItemId = t.Id, code = t.Code, points = t.Points })
            .ToListAsync(ct);

        // Лекции текущего модуля и их задачи.
        var lectures = await _db.Activities.AsNoTracking()
            .Where(a => a.ModuleId == session.ModuleId && a.Type == ActivityType.Lecture)
            .Select(a => new {
                sourceActivityId = a.Id,
                title = a.Title,
                tasks = a.TaskSets.SelectMany(ts => ts.Tasks)
                    .Select(t => new { taskItemId = t.Id, code = t.Code, points = t.Points })
                    .ToList()
            })
            .ToListAsync(ct);

        var sources = new List<object>();
        if (homeworkTasks.Count > 0)
            sources.Add(new { sourceActivityId = activityId, kind = "homework", title = "Домашки", tasks = homeworkTasks });
        foreach (var l in lectures.Where(l => l.tasks.Count > 0))
            sources.Add(new { sourceActivityId = l.sourceActivityId, kind = "lecture", title = l.title, tasks = l.tasks });

        // Мои сдачи на этой паре.
        var mySubs = await _db.HomeworkSubmissions.AsNoTracking()
            .Where(s => s.ActivityId == activityId && s.Members.Any(m => m.UserId == uid.Value))
            .Select(s => new {
                submissionId = s.Id,
                taskItemId = s.TaskItemId,
                code = s.TaskItem.Code,
                status = s.Status.ToString(),
                timeCoefficient = s.TimeCoefficient,
                documentUrl = s.DocumentUrl
            })
            .ToListAsync(ct);

        return Ok(new { activityTitle = session.Title, sources, mySubmissions = mySubs });
    }

    /// <summary>Сдать одну или несколько задач одной ссылкой (Дорешка). Группа 1–3 человека.</summary>
    [HttpPost("activities/{activityId:guid}/doreshka/submit")]
    public async Task<IActionResult> SubmitDoreshka(Guid activityId, [FromBody] SubmitDoreshkaDto dto, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        if (dto.TaskItemIds is null || dto.TaskItemIds.Count == 0)
            return BadRequest(new { error = "Выберите хотя бы одну задачу." });

        var ids = new List<Guid>();
        foreach (var taskItemId in dto.TaskItemIds.Distinct())
        {
            var r = await _svc.CreateSubmission(uid.Value, activityId, taskItemId, dto.DocumentUrl, dto.MemberUserIds, ct);
            if (!r.IsOk) return BadRequest(new { error = r.Error });
            ids.Add(r.Value);
        }
        return Ok(new { ids });
    }

    /// <summary>Создать сдачу (одна задача). Группа 1–3 человека, обязательна ссылка.</summary>
    [HttpPost("homework/submissions")]
    public async Task<IActionResult> Create([FromBody] CreateHwDto dto, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _svc.CreateSubmission(uid.Value, dto.ActivityId, dto.TaskItemId, dto.DocumentUrl, dto.MemberUserIds, ct);
        return r.IsOk ? Ok(new { id = r.Value }) : BadRequest(new { error = r.Error });
    }

    /// <summary>Очередь Дорешки по занятию (Teacher/Assistant). Отсортирована по приоритетам + FIFO.</summary>
    [HttpGet("activities/{activityId:guid}/homework-queue")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> Queue(Guid activityId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _svc.GetQueue(uid.Value, activityId, ct);
        return r.IsOk ? Ok(r.Value) : BadRequest(new { error = r.Error });
    }

    /// <summary>Начать приём (Teacher/Assistant).</summary>
    [HttpPost("homework/submissions/{submissionId:guid}/review/start")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> StartReview(Guid submissionId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _svc.StartReview(uid.Value, submissionId, ct);
        return r.IsOk ? Ok() : BadRequest(new { error = r.Error });
    }

    /// <summary>Завершить приём: принято (с коэффициентом 0.8–1.2) или нет.</summary>
    [HttpPost("homework/submissions/{submissionId:guid}/review/complete")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> CompleteReview(Guid submissionId, [FromBody] CompleteHwDto dto, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _svc.CompleteReview(uid.Value, submissionId, dto.Accepted, dto.DefenderCoefficient, ct);
        return r.IsOk ? Ok() : BadRequest(new { error = r.Error });
    }

    /// <summary>Вернуть в конец очереди.</summary>
    [HttpPost("homework/submissions/{submissionId:guid}/review/back-to-queue")]
    [Authorize(Roles = $"{AppRoles.Assistant},{AppRoles.Teacher},{AppRoles.Admin}")]
    public async Task<IActionResult> BackToQueue(Guid submissionId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _svc.BackToQueue(uid.Value, submissionId, ct);
        return r.IsOk ? Ok() : BadRequest(new { error = r.Error });
    }

    public sealed record CreateHwDto(
        Guid ActivityId,
        Guid TaskItemId,
        string DocumentUrl,
        IReadOnlyList<Guid> MemberUserIds);

    public sealed record SubmitDoreshkaDto(
        IReadOnlyList<Guid> TaskItemIds,
        string DocumentUrl,
        IReadOnlyList<Guid> MemberUserIds);

    public sealed record CompleteHwDto(bool Accepted, decimal? DefenderCoefficient);
}
