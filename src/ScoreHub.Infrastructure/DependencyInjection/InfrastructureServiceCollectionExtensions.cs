using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using ScoreHub.Application.Auth;
using ScoreHub.Infrastructure.Auth;
using ScoreHub.Infrastructure.Persistence;

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

        return services;
    }
}
