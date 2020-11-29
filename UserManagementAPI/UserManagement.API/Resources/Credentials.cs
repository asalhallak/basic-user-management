using Newtonsoft.Json;

namespace UserManagementAPI.Resources
{
    public class Credentials
    {
        [JsonProperty("userName")]
        public string UserName { get; set; }
        [JsonProperty("password")]
        public string Password { get; set; }
    }
}