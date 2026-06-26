using Domain.Entities;
using Domain.Interfaces;

namespace DataAccess.EFCore.Repositories
{
    /// <summary>
    /// EF Core implementation of <see cref="IAddressRepository"/>.
    /// Inherits standard CRUD from <see cref="GenericRepository{T}"/>.
    /// </summary>
    public class AddressRepository: GenericRepository<Address>, IAddressRepository
    {
        public AddressRepository(ApplicationContext context) : base(context)
        {
        }
    }
}
