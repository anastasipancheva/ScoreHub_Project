using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ScoreHub.Application.Abstractions;

namespace ScoreHub.Api.Controllers;

/// <summary>Мини-тест в начале занятия (окно и максимальный балл задаются на занятии).</summary>
[ApiController]
[Route("api/activities/{activityId:guid}/mini-test")]
[Authorize]
public sealed class MiniTestController : ApiControllerBase
{
    private readonly IMiniTestService _mini;

    public MiniTestController(IMiniTestService mini)
    {
        _mini = mini;
    }

    /// <summary>Отправить попытку мини-теста (одна на пользователя и занятие; только внутри окна времени).</summary>
    /// <remarks>Сейчас начисляется полный MiniTestMaxPoints без вопросов (заглушка для дальнейшего расширения).</remarks>
    [HttpPost("submit")]
    public async Task<IActionResult> Submit(Guid activityId, CancellationToken ct)
    {
        var uid = CurrentUserId;
        if (uid is null) return Unauthorized();
        var r = await _mini.Submit(uid.Value, activityId, ct);
        return r.IsOk ? Ok(new { score = r.Value }) : BadRequest(new { error = r.Error });
    }
}
