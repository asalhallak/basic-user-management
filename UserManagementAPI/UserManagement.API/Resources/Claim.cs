using Newtonsoft.Json;

namespace UserManagementAPI.Resources
{
    /// <summary>
    /// Successful login response from <c>POST /api/v1/auth/login</c>.
    /// Invalid credentials return <c>401 Unauthorized</c> with no body.
    /// </summary>
    public class Claims
    {
        /// <summary>
        /// Echoes the authenticated username from the login request.
        /// </summary>
        [JsonProperty("userName")]
        public string UserName { get; set; }

        /// <summary>
        /// JWT signed by <see cref="Helpers.JwtHelper"/>; attach as <c>Authorization: Bearer</c>.
        /// </summary>
        [JsonProperty("token")]
        public string Token { get; set; }
    }
}
