// using Microsoft.EntityFrameworkCore;
//
// namespace UserManagementAPI.Model.DB
// {
//     public class UsersManagement : DbContext
//     {
//         public UsersManagement(DbContextOptions<UsersManagement> options) : base(options)
//         {
//             
//         }
//         public DbSet<User> Users { get; set; }
//         public DbSet<Address> Addresses { get; set; }
//         protected override void OnModelCreating(ModelBuilder modelBuilder)
//         {
//             modelBuilder.Entity<User>().ToTable("User");
//             modelBuilder.Entity<Address>().ToTable("Address");
//         }
//
//     }
// }