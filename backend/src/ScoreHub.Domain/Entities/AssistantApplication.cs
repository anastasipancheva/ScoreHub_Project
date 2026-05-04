namespace ScoreHub.Domain.Entities;
public sealed class AssistantApplication
{
    public Guid Id { get; set; }
    public Guid ActivityId { get; set; }
    public Activity Activity { get; set; } = null!;
    public Guid AssistantId { get; set; }
    public User Assistant { get; set; } = null!;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
    public string? Message { get; set; }
    public DateTimeOffset AppliedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? ReviewedAt { get; set; }
}
