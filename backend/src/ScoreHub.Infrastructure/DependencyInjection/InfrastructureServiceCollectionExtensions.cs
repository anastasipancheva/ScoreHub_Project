using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ScoreHub.Application.Abstractions;
using ScoreHub.Application.Auth;
using ScoreHub.Infrastructure.Auth;
using ScoreHub.Infrastructure.Persistence;
using ScoreHub.Infrastructure.Services;
// ReSharper disable once RedundantUsingDirective

namespace ScoreHub.Infrastructure.DependencyInjection;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Строка подключения берётся из конфигурации (appsettings / env ConnectionStrings__ScoreHub).
        var connectionString = configuration.GetConnectionString("ScoreHub");

        // Локальный дефолт (для разработки и design-time миграций), если строка не задана.
        if (string.IsNullOrWhiteSpace(connectionString))
            connectionString = "Host=localhost;Port=5432;Database=scorehub;Username=postgres;Password=postgres";

        services.AddDbContext<ScoreHubDbContext>(opts => opts.UseNpgsql(connectionString));

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ITeachingSetupService, TeachingSetupService>();
        services.AddScoped<IGroupActivityService, GroupActivityService>();
        services.AddScoped<IControlPointService, ControlPointService>();
        services.AddScoped<IMiniTestService, MiniTestService>();
        services.AddScoped<IHomeworkService, HomeworkService>();
        services.AddScoped<IScoringService, ScoringService>();
        services.AddScoped<ITeamGenerationService, TeamGenerationService>();
        services.AddScoped<ICourseTemplateService, CourseTemplateService>();

        return services;
    }
}
