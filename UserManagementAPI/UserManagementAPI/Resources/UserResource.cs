using System;
using Domain.Entities;
using Newtonsoft.Json;

namespace UserManagementAPI.Models
{
    public class UserResource
    {
        [JsonProperty("id")]
        public int Id { get; set; }
        [JsonProperty("loginName")]
        public string LoginName { get; set; }
        [JsonProperty("displayName")]
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