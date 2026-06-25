using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using UserManagementAPI.Controllers.V1;
using UserManagementAPI.Helpers;
using UserManagementAPI.Resources;
using UserManagementAPI.Services;
using Xunit;

namespace UserManagementAPI.Tests
{
    public class AuthControllerTests
    {
        private static AuthController CreateController()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["JwtSecret"] = "integration-test-jwt-secret-key-min-32-chars"
                })
                .Build();
            var authService = new AuthService(new JwtHelper(config));
            return new AuthController(authService);
        }

        [Fact]
        public void Login_ValidCredentials_ReturnsOkWithClaims()
        {
            var controller = CreateController();
            var credentials = new Credentials { UserName = "admin", Password = "123456789" };

            var result = controller.Login(credentials);

            var ok = Assert.IsType<OkObjectResult>(result);
            var claims = Assert.IsType<Claims>(ok.Value);
            Assert.Equal("admin", claims.UserName);
            Assert.False(string.IsNullOrWhiteSpace(claims.Token));
        }

        [Fact]
        public void Login_InvalidPassword_ReturnsUnauthorized()
        {
            var controller = CreateController();
            var credentials = new Credentials { UserName = "admin", Password = "wrong" };

            var result = controller.Login(credentials);

            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public void Login_InvalidUsername_ReturnsUnauthorized()
        {
            var controller = CreateController();
            var credentials = new Credentials { UserName = "notadmin", Password = "123456789" };

            var result = controller.Login(credentials);

            Assert.IsType<UnauthorizedResult>(result);
        }

        [Fact]
        public void Login_NullCredentials_ReturnsUnauthorized()
        {
            var controller = CreateController();

            var result = controller.Login(null);

            Assert.IsType<UnauthorizedResult>(result);
        }
    }
}
