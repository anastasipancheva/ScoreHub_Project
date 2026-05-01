using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ScoreHub.Application.Abstractions;
using ScoreHub.Application.Auth;
using ScoreHub.Infrastructure.Auth;
using ScoreHub.Infrastructure.Persistence;
using ScoreHub.Infrastructure.Services;

namespace ScoreHub.Infrastructure.DependencyInjection;

public static class InfrastructureServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("ScoreHub");

        if (string.IsNullOrWhiteSpace(connectionString))
            connectionString = "Data Source=scorehub.dev.db";

        services.AddDbContext<ScoreHubDbContext>(opts => opts.UseSqlite(connectionString));

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddSingleton<IJwtTokenService, JwtTokenService>();

        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<ITeachingSetupService, TeachingSetupService>();
        services.AddScoped<IGroupActivityService, GroupActivityService>();
        services.AddScoped<IControlPointService, ControlPointService>();

        return services;
    }
}
