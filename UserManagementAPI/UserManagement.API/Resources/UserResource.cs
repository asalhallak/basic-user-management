using System;
using System.ComponentModel.DataAnnotations;
using Newtonsoft.Json;

namespace UserManagementAPI.Resources
{
    /// <summary>
    /// Request and response shape for all <c>/api/v1/users</c> endpoints.
    /// Serialized with explicit <see cref="JsonPropertyAttribute"/> names (camelCase JSON).
    /// </summary>
    public class UserResource
    {
        /// <summary>Database-assigned identifier. Set from the URL on update; omit on create.</summary>
        [JsonProperty("id")]
        public int Id { get; set; }

        /// <summary>
        /// Unique user-record identifier (not the login <c>userName</c> from <see cref="Credentials"/>).
        /// </summary>
        [JsonProperty("loginName")]
        [Required]
        public string LoginName { get; set; }

        /// <summary>Human-readable display name shown in the UI.</summary>
        [JsonProperty("displayName")]
        [Required]
        public string DisplayName { get; set; }

        /// <summary>Date of birth in ISO 8601 format.</summary>
        [JsonProperty("dateOfBirth")]
        public DateTime DateOfBirth { get; set; }

        /// <summary>User-level country code or name (separate from nested address country).</summary>
        [JsonProperty("country")]
        public string Country { get; set; }

        /// <summary>Optional nested postal address; persisted as a related <see cref="AddressResource"/> row.</summary>
        [JsonProperty("address")]
        public AddressResource Address { get; set; }

        /// <summary>Whether the user record is active.</summary>
        [JsonProperty("isActive")]
        public bool IsActive { get; set; }

        /// <summary>Salary amount stored as a float.</summary>
        [JsonProperty("salary")]
        public float Salary { get; set; }

        /// <summary>Optional profile picture URL; may be null or omitted.</summary>
        [JsonProperty("profilePictureUrl")]
        public string ProfilePictureUrl { get; set; }
    }
}
