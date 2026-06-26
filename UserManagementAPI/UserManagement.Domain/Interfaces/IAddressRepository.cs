using Domain.Entities;

namespace Domain.Interfaces
{
    /// <summary>
    /// Repository contract for <see cref="Address"/> entities.
    /// Extends <see cref="IGenericRepository{T}"/> without additional query methods.
    /// </summary>
    public interface IAddressRepository: IGenericRepository<Address>
    {
    }
}
