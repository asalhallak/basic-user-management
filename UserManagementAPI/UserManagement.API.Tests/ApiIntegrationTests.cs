using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using Newtonsoft.Json;
using UserManagementAPI.Resources;
using Xunit;

namespace UserManagementAPI.Tests
{
    public class ApiIntegrationTests : IClassFixture<ApiWebApplicationFactory>
    {
        private readonly ApiWebApplicationFactory _factory;
        private readonly HttpClient _client;

        public ApiIntegrationTests(ApiWebApplicationFactory factory)
        {
            _factory = factory;
            _client = factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
        }

        [Fact]
        public async Task GetUsers_WithoutToken_ReturnsUnauthorized()
        {
            var response = await _client.GetAsync("/api/v1/users");

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsToken()
        {
            var response = await PostJsonAsync("/api/v1/auth/login", new Credentials
            {
                UserName = "admin",
                Password = "123456789"
            });

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);

            var claims = await ReadJsonAsync<Claims>(response);
            Assert.Equal("admin", claims.UserName);
            Assert.False(string.IsNullOrWhiteSpace(claims.Token));
        }

        [Fact]
        public async Task Login_InvalidCredentials_ReturnsUnauthorized()
        {
            var response = await PostJsonAsync("/api/v1/auth/login", new Credentials
            {
                UserName = "admin",
                Password = "wrong"
            });

            Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        }

        [Fact]
        public async Task UsersCrud_EndToEnd_ReturnsExpectedStatusCodes()
        {
            var token = await LoginAndGetTokenAsync();
            using var authedClient = CreateAuthedClient(token);

            var createResponse = await PostJsonAsync(authedClient, "/api/v1/users", new UserResource
            {
                LoginName = "integration-user",
                DisplayName = "Integration User"
            });
            Assert.Equal(HttpStatusCode.OK, createResponse.StatusCode);

            var created = await ReadJsonAsync<UserResource>(createResponse);
            Assert.Equal("integration-user", created.LoginName);
            Assert.True(created.Id > 0);

            var getResponse = await authedClient.GetAsync($"/api/v1/users/{created.Id}");
            Assert.Equal(HttpStatusCode.OK, getResponse.StatusCode);

            var missingResponse = await authedClient.GetAsync("/api/v1/users/99999");
            Assert.Equal(HttpStatusCode.NotFound, missingResponse.StatusCode);

            var duplicateResponse = await PostJsonAsync(authedClient, "/api/v1/users", new UserResource
            {
                LoginName = "integration-user",
                DisplayName = "Duplicate User"
            });
            Assert.Equal(HttpStatusCode.Conflict, duplicateResponse.StatusCode);

            var deleteResponse = await authedClient.DeleteAsync($"/api/v1/users/{created.Id}");
            Assert.Equal(HttpStatusCode.OK, deleteResponse.StatusCode);

            var deletedResponse = await authedClient.GetAsync($"/api/v1/users/{created.Id}");
            Assert.Equal(HttpStatusCode.NotFound, deletedResponse.StatusCode);
        }

        private async Task<string> LoginAndGetTokenAsync()
        {
            var response = await PostJsonAsync("/api/v1/auth/login", new Credentials
            {
                UserName = "admin",
                Password = "123456789"
            });
            response.EnsureSuccessStatusCode();
            var claims = await ReadJsonAsync<Claims>(response);
            return claims.Token;
        }

        private HttpClient CreateAuthedClient(string token)
        {
            var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
            {
                AllowAutoRedirect = false
            });
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            return client;
        }

        private Task<HttpResponseMessage> PostJsonAsync<T>(string url, T payload) =>
            PostJsonAsync(_client, url, payload);

        private static Task<HttpResponseMessage> PostJsonAsync<T>(HttpClient client, string url, T payload)
        {
            var json = JsonConvert.SerializeObject(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            return client.PostAsync(url, content);
        }

        private static async Task<T> ReadJsonAsync<T>(HttpResponseMessage response)
        {
            var json = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<T>(json);
        }
    }
}
