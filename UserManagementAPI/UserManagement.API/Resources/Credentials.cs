using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace UserManagementAPI.Resources
{
    public class Credentials
    {
        [JsonProperty("userName")]
        [Required]
        public string UserName { get; set; }

        [JsonProperty("password")]
        [Required]
        public string Password { get; set; }
    }
}