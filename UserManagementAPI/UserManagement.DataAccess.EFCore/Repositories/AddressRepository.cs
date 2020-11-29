using Domain.Entities;
using Domain.Interfaces;

namespace DataAccess.EFCore.Repositories
{
    public class AddressRepository: GenericRepository<Address>, IAddressRepository
    {
        public AddressRepository(ApplicationContext context) : base(context)
        {
        }
    }
}