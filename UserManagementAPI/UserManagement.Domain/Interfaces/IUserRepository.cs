using System.Collections.Generic;
using Domain.Entities;

namespace Domain.Interfaces
{
    /// <summary>
    /// Repository contract for <see cref="User"/> entities, including eager-loaded address queries.
    /// </summary>
    public interface IUserRepository: IGenericRepository<User>
    {
        /// <summary>Returns all users with their optional <see cref="User.Address"/> navigation loaded.</summary>
        public IEnumerable<User> GetAllIncludeAddress();

        /// <summary>
        /// Returns a user by ID with address included, or <see langword="null"/> when not found.
        /// </summary>
        /// <param name="id">Primary key of the user record.</param>
        public User GetIncludeAddress(int id);
    }
}
