using ScoreHub.Application.Abstractions;
using ScoreHub.Domain.Entities;
using ScoreHub.Infrastructure.Persistence;

namespace ScoreHub.Infrastructure.Services;

public sealed class NotificationService : INotificationService
{
    private readonly ScoreHubDbContext _db;

    public NotificationService(ScoreHubDbContext db)
    {
        _db = db;
    }

    public async Task NotifyManyAsync(
        IReadOnlyCollection<Guid> recipientIds,
        string type,
        string title,
        string? body,
        CancellationToken cancellationToken = default)
    {
        var now = DateTimeOffset.UtcNow;
        foreach (var id in recipientIds.Distinct())
        {
            _db.Notifications.Add(new Notification
            {
                Id = Guid.NewGuid(),
                RecipientId = id,
                Type = type,
                Title = title,
                Body = body,
                CreatedAt = now
            });
        }

        await _db.SaveChangesAsync(cancellationToken);
    }
}
