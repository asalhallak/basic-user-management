using Newtonsoft.Json;

namespace UserManagementAPI.Models
{
    public class AddressResource
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        [JsonProperty("city")]
        public string City { get; set; }
        [JsonProperty("country")]
        public string Country { get; set; }
        [JsonProperty("postalCode")]
        public string PostalCode { get; set; }
        [JsonProperty("state")]
        public string State { get; set; }
        [JsonProperty("streetName")]
        public string StreetName { get; set; }
        [JsonProperty("streetNumber")]
        public string StreetNumber { get; set; }
    }
}