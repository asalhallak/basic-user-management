using Newtonsoft.Json;

namespace UserManagementAPI.Resources
{
    public class Claims
    {
        [JsonProperty("userName")]
        public string UserName { get; set; }
        [JsonProperty("token")]
        public string Token { get; set; }
    }
}