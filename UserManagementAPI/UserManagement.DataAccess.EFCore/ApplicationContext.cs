using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.EFCore
{
    /// <summary>
    /// EF Core database context for the User Management sample.
    /// Configures unique indexes on <see cref="User.LoginName"/> and entity primary keys.
    /// </summary>
    public sealed class ApplicationContext : DbContext
    {
        public ApplicationContext(DbContextOptions<ApplicationContext> options) : base(options)
        {
            ChangeTracker.LazyLoadingEnabled = false;
        }

        /// <summary>Users table mapped to <see cref="User"/> entities.</summary>
        public DbSet<User> Users { get; set; }

        /// <summary>Addresses table mapped to <see cref="Address"/> entities.</summary>
        public DbSet<Address> Addresses { get; set; }

        /// <inheritdoc />
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
