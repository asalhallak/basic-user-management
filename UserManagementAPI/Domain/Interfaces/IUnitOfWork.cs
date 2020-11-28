using System;

namespace Domain.Interfaces
{
    public interface IUnitOfWork: IDisposable
    {
        IUserRepository Users { get; }
        IAddressRepository Addresses { get; }
        int Complete();
    }
}