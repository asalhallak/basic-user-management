using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace UserManagementAPI.Resources
{
    /// <summary>
    /// Login request body for <c>POST /api/v1/auth/login</c>.
    /// Uses <c>userName</c> (not user-record <c>loginName</c>); see docs/api-resources.md.
    /// </summary>
    public class Credentials
    {
        /// <summary>
        /// Development login name. Only <c>admin</c> is accepted in this sample.
        /// </summary>
        [JsonProperty("userName")]
        [Required]
        public string UserName { get; set; }

        /// <summary>
        /// Development password paired with <see cref="UserName"/>.
        /// </summary>
        [JsonProperty("password")]
        [Required]
        public string Password { get; set; }
    }
}
