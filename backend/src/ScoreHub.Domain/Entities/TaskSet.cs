namespace ScoreHub.Domain.Entities;

/// <summary>
/// A configurable set of tasks for an activity (lecture/KT/homework session).
/// </summary>
public sealed class TaskSet
{
    public Guid Id { get; set; }

    public Guid ActivityId { get; set; }
    public Activity Activity { get; set; } = null!;

    public string Title { get; set; } = null!;

    public List<TaskItem> Tasks { get; set; } = new();
}

