using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ScoreHub.Domain.Auth;
using ScoreHub.Domain.Enums;
using ScoreHub.Infrastructure.Persistence;

namespace ScoreHub.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = AppRoles.Admin)]
public sealed class AdminController : ControllerBase
{
    private readonly ScoreHubDbContext _db;

    public AdminController(ScoreHubDbContext db)
    {
        _db = db;
    }

    [HttpPost("users/{userId:guid}/roles")]
    public async Task<IActionResult> SetRole(Guid userId, [FromBody] SetRoleDto dto, CancellationToken ct)
    {
        if (!Enum.TryParse<UserRole>(dto.RoleName, ignoreCase: true, out var role)
            || !Enum.IsDefined(typeof(UserRole), role))
            return BadRequest(new { error = "Invalid role name." });

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId, ct);
        if (user is null)
            return NotFound();

        user.Role = role;
        await _db.SaveChangesAsync(ct);

        return Ok(new { userId, role = role.ToString() });
    }

    public sealed record SetRoleDto(string RoleName);
}
