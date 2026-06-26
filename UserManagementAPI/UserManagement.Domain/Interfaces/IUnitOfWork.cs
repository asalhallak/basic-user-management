using System;

namespace Domain.Interfaces
{
    /// <summary>
    /// Unit-of-work boundary that groups repository access and persists changes in one transaction.
    /// Registered as scoped in <c>Startup.cs</c>; see docs/repository-pattern.md.
    /// </summary>
    public interface IUnitOfWork: IDisposable
    {
        /// <summary>User repository with address-aware query methods.</summary>
        IUserRepository Users { get; }

        /// <summary>Address repository for standalone address CRUD.</summary>
        IAddressRepository Addresses { get; }

        /// <summary>Persists all staged changes and returns the number of rows affected.</summary>
        int Complete();
    }
}
