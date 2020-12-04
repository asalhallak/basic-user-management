using System.Collections.Generic;
using System.Linq;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.EFCore.Repositories
{
    public class UserRepository: GenericRepository<User>, IUserRepository
    {
        public UserRepository(ApplicationContext context) : base(context)
        {
            
        }
        public IEnumerable<User> GetAllIncludeAddress()
        {
            return _context.Users.Include(u => u.Address).ToList();
        }
        public User GetIncludeAddress(int id)
        {
            return _context.Users
                .Where(u => u.Id == id)
                .Include(u => u.Address)
                .FirstOrDefault();
        }
    }
}