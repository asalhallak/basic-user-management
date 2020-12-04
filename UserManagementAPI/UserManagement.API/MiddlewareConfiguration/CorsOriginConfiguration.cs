using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace UserManagementAPI.MiddlewareConfiguration
{
    public static class CorsOriginConfiguration
    {
        public static IApplicationBuilder UseCorsOrigin(this IApplicationBuilder app)
        {
            return app.UseCors("AllowAny");
        }

        public static IServiceCollection AddCorsOrigin(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy(
                    "AllowAny",
                    x =>
                    {
                        x.AllowAnyHeader()
                            .AllowAnyMethod()
                            .SetIsOriginAllowed(_ => true)
                            .AllowCredentials();
                    });
            });
            return services;
        }
    }
}