using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace UserManagementAPI.Resources
{
    public class UserResource
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        [JsonProperty("loginName")]
        [Required]
        public string LoginName { get; set; }
        [JsonProperty("displayName")]
        [Required]
        public string DisplayName { get; set; }
        [JsonProperty("dateOfBirth")]
        public DateTime DateOfBirth { get; set; }
        [JsonProperty("country")]
        public string Country { get; set; }
        [JsonProperty("address")]
        public AddressResource Address { get; set; }
        [JsonProperty("isActive")]
        public bool IsActive { get; set; }
        [JsonProperty("salary")]
        public float Salary { get; set; }
        [JsonProperty("profilePictureUrl")]
        public string ProfilePictureUrl { get; set; }
    }
}