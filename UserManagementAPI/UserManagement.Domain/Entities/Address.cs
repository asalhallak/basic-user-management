using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    /// <summary>
    /// Domain address entity persisted in the <c>Addresses</c> table.
    /// Linked to a <see cref="User"/> via optional one-to-one relationship.
    /// </summary>
    public class Address
    {
        /// <summary>Primary key assigned by the database.</summary>
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        /// <summary>City name.</summary>
        public string City { get; set; }

        /// <summary>Country code or name.</summary>
        public string Country { get; set; }

        /// <summary>Postal or ZIP code.</summary>
        public string PostalCode { get; set; }

        /// <summary>State, province, or region.</summary>
        public string State { get; set; }

        /// <summary>Street name.</summary>
        public string StreetName { get; set; }

        /// <summary>Street number or building identifier.</summary>
        public string StreetNumber { get; set; }
    }
}
