using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    /// <summary>
    /// Domain user entity persisted in the <c>Users</c> table.
    /// Maps to <c>UserResource</c> at the API boundary; see docs/domain-model.md.
    /// </summary>
    public class User
    {
        /// <summary>Primary key assigned by the database.</summary>
        public int Id { get; set; }

        /// <summary>Unique login identifier; enforced by a database unique index.</summary>
        public string LoginName { get; set; }

        /// <summary>Human-readable display name shown in the UI.</summary>
        public string DisplayName { get; set; }

        /// <summary>Date of birth stored as a <see cref="DateTime"/>.</summary>
        public DateTime DateOfBirth { get; set; }

        /// <summary>Country code or name for the user profile.</summary>
        public string Country { get; set; }

        /// <summary>Optional one-to-one address navigation property.</summary>
        [ForeignKey("AddressId")]
        public Address Address { get; set; }

        /// <summary>Whether the user account is active.</summary>
        public bool IsActive { get; set; }

        /// <summary>Salary value stored as a single-precision float.</summary>
        public float Salary { get; set; }

        /// <summary>Optional URL to a profile picture; may be null or empty.</summary>
        public string ProfilePictureUrl { get; set; }
    }
}
