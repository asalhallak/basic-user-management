using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using UserManagementAPI.Helpers;
using UserManagementAPI.Resources;
using UserManagementAPI.Services;
using Xunit;

namespace UserManagementAPI.Tests
{
    public class AuthServiceTests
    {
        private static AuthService CreateAuthService()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["JwtSecret"] = "integration-test-jwt-secret-key-min-32-chars"
                })
                .Build();
            return new AuthService(new JwtHelper(config));
        }

        [Fact]
        public void Login_ValidCredentials_ReturnsClaimsWithToken()
        {
            var auth = CreateAuthService();
            var credentials = new Credentials { UserName = "admin", Password = "123456789" };

            var result = auth.Login(credentials);

            Assert.NotNull(result);
            Assert.Equal("admin", result.UserName);
            Assert.False(string.IsNullOrWhiteSpace(result.Token));
        }

        [Fact]
        public void Login_InvalidPassword_ReturnsNull()
        {
            var auth = CreateAuthService();
            var credentials = new Credentials { UserName = "admin", Password = "wrong" };

            Assert.Null(auth.Login(credentials));
        }

        [Fact]
        public void Login_InvalidUsername_ReturnsNull()
        {
            var auth = CreateAuthService();
            var credentials = new Credentials { UserName = "notadmin", Password = "123456789" };

            Assert.Null(auth.Login(credentials));
        }

        [Fact]
        public void Login_NullCredentials_ReturnsNull()
        {
            var auth = CreateAuthService();

            Assert.Null(auth.Login(null));
        }
    }
}
