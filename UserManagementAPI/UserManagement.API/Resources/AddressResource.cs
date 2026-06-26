using Newtonsoft.Json;

namespace UserManagementAPI.Resources
{
    /// <summary>
    /// Nested postal address on <see cref="UserResource"/>.
    /// Persisted as a separate <c>Addresses</c> table row linked by <c>Users.AddressId</c>.
    /// </summary>
    public class AddressResource
    {
        /// <summary>
        /// Database-assigned identifier. Omit on create; include when updating an existing address.
        /// </summary>
        [JsonProperty("id")]
        public int Id { get; set; }

        /// <summary>City or locality name.</summary>
        [JsonProperty("city")]
        public string City { get; set; }

        /// <summary>Address country (may differ from the user-level <see cref="UserResource.Country"/>).</summary>
        [JsonProperty("country")]
        public string Country { get; set; }

        /// <summary>Postal or ZIP code.</summary>
        [JsonProperty("postalCode")]
        public string PostalCode { get; set; }

        /// <summary>State, province, or region.</summary>
        [JsonProperty("state")]
        public string State { get; set; }

        /// <summary>Street name without the building number.</summary>
        [JsonProperty("streetName")]
        public string StreetName { get; set; }

        /// <summary>Building or street number.</summary>
        [JsonProperty("streetNumber")]
        public string StreetNumber { get; set; }
    }
}
