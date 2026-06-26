using System.Collections.Generic;
using System.Linq;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.EFCore.Repositories
{
    /// <summary>
    /// EF Core implementation of <see cref="IUserRepository"/> with eager-loaded address queries.
    /// </summary>
    public class UserRepository: GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationContext context) : base(context)
        {
        }

        /// <inheritdoc />
        public IEnumerable<User> GetAllIncludeAddress()
        {
            return _context.Users.Include(u => u.Address).ToList();
        }

        /// <inheritdoc />
        public User GetIncludeAddress(int id)
        {
            return _context.Users
                .Where(u => u.Id == id)
                .Include(u => u.Address)
                .FirstOrDefault();
        }
    }
}
