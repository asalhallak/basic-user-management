using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace Domain.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string LoginName { get; set; }
        public string DisplayName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Country { get; set; }
        [ForeignKey("AddressId")]
        public Address Address { get; set; }
        public bool IsActive { get; set; }
        public float Salary { get; set; }
        public string ProfilePictureUrl { get; set; }
    }
}