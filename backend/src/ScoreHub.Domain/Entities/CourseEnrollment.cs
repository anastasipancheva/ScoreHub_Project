namespace ScoreHub.Domain.Entities;

/// <summary>
/// Records that a student is enrolled in a course.
/// </summary>
public sealed class CourseEnrollment
{
    public Guid CourseId { get; set; }
    public Course Course { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public DateTimeOffset EnrolledAt { get; set; } = DateTimeOffset.UtcNow;
}
