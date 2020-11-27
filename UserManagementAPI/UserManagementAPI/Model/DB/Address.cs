namespace UserManagementAPI.Model.DB
{
    public class Address
    {
        public int Id { get; set; }
        public string City { get; set; }
        public string Country { get; set; }
        public string PostalCode { get; set; }
        public string State { get; set; }
        public string StreetName { get; set; }
        public string StreetNumber { get; set; }
    }
}