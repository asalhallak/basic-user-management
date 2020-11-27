using Domain.Entities;
using Domain.Model.DB;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.EFCore
{
    public class AppContext : DbContext
    {
        public AppContext(DbContextOptions<AppContext> options) : base(options)
        {
        }
        public DbSet<User> Users { get; set; }
        public DbSet<Address> Addresses { get; set; }
    }
}