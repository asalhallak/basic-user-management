using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.EFCore
{
    public class ApplicationContext : DbContext
    {
        public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Address> Addresses { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>()
                .HasIndex(u => new {u.Id })
                .IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => new {u.LoginName })
                .IsUnique();
            modelBuilder.Entity<Address>()
                .HasIndex(a => new {a.Id })
                .IsUnique();
        }
    }
}