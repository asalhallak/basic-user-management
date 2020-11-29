using DataAccess.EFCore.Repositories;
using Domain.Interfaces;

namespace DataAccess.EFCore.UnitOfWorks
{
    public class UnitOfWork : IUnitOfWork
    {
        public IUserRepository Users { get; }
        public IAddressRepository Addresses { get; }
        private readonly ApplicationContext _context;

        public UnitOfWork(ApplicationContext context)
        {
            _context = context;
            Users = new UserRepository(_context);
            Addresses = new AddressRepository(_context);
        }
   
        public int Complete()
        {
            return _context.SaveChanges();
        }
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}