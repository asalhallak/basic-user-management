using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using UserManagementAPI.Helpers;
using UserManagementAPI.Resources;
using Xunit;

namespace UserManagementAPI.Tests
{
    public class JwtHelperTests
    {
        private const string TestSecret = "integration-test-jwt-secret-key-min-32-chars";

        private static JwtHelper CreateJwtHelper()
        {
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["JwtSecret"] = TestSecret
                })
                .Build();
            return new JwtHelper(config);
        }

        [Fact]
        public void GenerateToken_ReturnsNonEmptyJwt()
        {
            var jwtHelper = CreateJwtHelper();
            var user = new Claims { UserName = "admin" };

            var token = jwtHelper.GenerateToken(user);

            Assert.False(string.IsNullOrWhiteSpace(token));
        }

        [Fact]
        public void GenerateToken_IncludesUserNameClaim()
        {
            var jwtHelper = CreateJwtHelper();
            var user = new Claims { UserName = "admin" };

            var token = jwtHelper.GenerateToken(user);
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var nameClaim = jwt.Claims.FirstOrDefault(c =>
                c.Type == ClaimTypes.Name ||
                c.Type == "unique_name" ||
                c.Type == "name" ||
                c.Type == "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name");

            Assert.NotNull(nameClaim);
            Assert.Equal("admin", nameClaim.Value);
        }

        [Fact]
        public void GenerateToken_ExpiresInSevenDays()
        {
            var jwtHelper = CreateJwtHelper();
            var user = new Claims { UserName = "admin" };
            var before = DateTime.UtcNow;

            var token = jwtHelper.GenerateToken(user);
            var handler = new JwtSecurityTokenHandler();
            var jwt = handler.ReadJwtToken(token);
            var expectedExpiry = before.AddDays(7);
            Assert.InRange(jwt.ValidTo, expectedExpiry.AddMinutes(-1), expectedExpiry.AddMinutes(1));
        }
    }
}
