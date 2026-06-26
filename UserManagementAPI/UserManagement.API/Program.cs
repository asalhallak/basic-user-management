using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace UserManagementAPI
{
    /// <summary>
    /// Application entry point; builds and runs the ASP.NET Core host with <see cref="Startup"/>.
    /// </summary>
    public class Program
    {
        /// <summary>
        /// Starts the web host.
        /// </summary>
        /// <param name="args">Command-line arguments passed to the host builder.</param>
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        /// <summary>
        /// Creates the default host builder and wires <see cref="Startup"/> for service and pipeline configuration.
        /// </summary>
        /// <param name="args">Command-line arguments passed to the host builder.</param>
        /// <returns>A configured <see cref="IHostBuilder"/>.</returns>
        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); });
    }
}