using DataAccess.EFCore.Repositories;
using Domain.Interfaces;

namespace DataAccess.EFCore.UnitOfWorks
{
    /// <summary>
    /// Scoped unit-of-work that shares one <see cref="ApplicationContext"/> across repositories
    /// and commits changes via <see cref="Complete"/>.
    /// </summary>
    public class UnitOfWork : IUnitOfWork
    {
        /// <inheritdoc />
        public IUserRepository Users { get; }

        /// <inheritdoc />
        public IAddressRepository Addresses { get; }

        private readonly ApplicationContext _context;

        public UnitOfWork(ApplicationContext context)
        {
            _context = context;
            Users = new UserRepository(_context);
            Addresses = new AddressRepository(_context);
        }

        /// <inheritdoc />
        public int Complete()
        {
            return _context.SaveChanges();
        }

        /// <inheritdoc />
        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
