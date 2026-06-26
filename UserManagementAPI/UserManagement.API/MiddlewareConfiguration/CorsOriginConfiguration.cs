using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;

namespace UserManagementAPI.MiddlewareConfiguration
{
    /// <summary>
    /// Extension methods that register and apply the permissive <c>"AllowAny"</c> CORS policy for local Angular development.
    /// </summary>
    /// <remarks>
    /// Restrict origins before non-local deployment — see <c>docs/cors-configuration.md</c>.
    /// </remarks>
    public static class CorsOriginConfiguration
    {
        /// <summary>
        /// Applies the <c>"AllowAny"</c> CORS policy on each request.
        /// </summary>
        /// <param name="app">The application builder.</param>
        /// <returns>The same <paramref name="app"/> for chaining.</returns>
        public static IApplicationBuilder UseCorsOrigin(this IApplicationBuilder app)
        {
            return app.UseCors("AllowAny");
        }

        /// <summary>
        /// Registers the <c>"AllowAny"</c> CORS policy (any origin, header, and method; credentials allowed).
        /// </summary>
        /// <param name="services">The service collection.</param>
        /// <returns>The same <paramref name="services"/> for chaining.</returns>
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
