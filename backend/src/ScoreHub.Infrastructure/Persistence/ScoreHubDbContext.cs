using Microsoft.EntityFrameworkCore;
using ScoreHub.Domain.Entities;

namespace ScoreHub.Infrastructure.Persistence;

public sealed class ScoreHubDbContext : DbContext
{
    public ScoreHubDbContext(DbContextOptions<ScoreHubDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Module> Modules => Set<Module>();
    public DbSet<Activity> Activities => Set<Activity>();

    public DbSet<Team> Teams => Set<Team>();
    public DbSet<TeamMember> TeamMembers => Set<TeamMember>();
    public DbSet<TeamAssistant> TeamAssistants => Set<TeamAssistant>();

    public DbSet<TaskSet> TaskSets => Set<TaskSet>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();
    public DbSet<TaskAssistant> TaskAssistants => Set<TaskAssistant>();

    public DbSet<TeamHelpRequest> TeamHelpRequests => Set<TeamHelpRequest>();
    public DbSet<TaskSubmission> TaskSubmissions => Set<TaskSubmission>();

    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(x => x.Email)
            .IsUnique();

        modelBuilder.Entity<TeamMember>()
            .HasKey(x => new { x.TeamId, x.UserId });

        modelBuilder.Entity<TeamAssistant>()
            .HasKey(x => new { x.TeamId, x.AssistantId });

        modelBuilder.Entity<TaskAssistant>()
            .HasKey(x => new { x.TaskItemId, x.AssistantId });

        modelBuilder.Entity<TaskSubmission>()
            .HasIndex(x => new { x.ActivityId, x.TaskItemId, x.TeamId, x.StudentId });

        modelBuilder.Entity<TeamMember>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TeamAssistant>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.AssistantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TaskAssistant>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.AssistantId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TeamHelpRequest>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Notification>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.RecipientId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<TaskSubmission>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TaskSubmission>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.ReviewerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<TaskSubmission>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(x => x.DefenderUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
