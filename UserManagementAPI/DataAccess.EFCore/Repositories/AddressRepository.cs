using Domain.Entities;

namespace DataAccess.EFCore.Repositories
{
    public class AddressRepository: GenericRepository<Address>
    {
        public AddressRepository(ApplicationContext context) : base(context)
        {
        }
    }
}