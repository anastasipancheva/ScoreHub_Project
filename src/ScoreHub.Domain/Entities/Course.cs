namespace ScoreHub.Domain.Entities;

public sealed class Course
{
    public Guid Id { get; set; }

    public string Code { get; set; } = null!; // e.g. MKN2
    public string Title { get; set; } = null!;
    public string AcademicYear { get; set; } = null!; // e.g. 2024/2025

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public List<Module> Modules { get; set; } = new();
}

