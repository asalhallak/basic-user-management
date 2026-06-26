using System.Collections.Generic;
using System.Linq;
using Domain.Entities;
using Domain.Interfaces;

namespace UserManagementAPI.Services
{
    /// <summary>
    /// Orchestrates user CRUD through <see cref="IUnitOfWork"/> and returns domain entities.
    /// Controllers map to <c>UserResource</c> DTOs; see docs/api-services.md.
    /// </summary>
    public class UsersService
    {
        private readonly IUnitOfWork _unitOfWork;

        public UsersService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        /// <summary>
        /// Returns all users with their optional nested address loaded.
        /// </summary>
        public IEnumerable<User> GetAll()
        {
            return _unitOfWork.Users.GetAllIncludeAddress();
        }

        /// <summary>
        /// Returns a user by ID with address included, or <see langword="null"/> when not found.
        /// </summary>
        /// <param name="id">Primary key of the user record.</param>
        public User Get(int id)
        {
            var user = _unitOfWork.Users.GetIncludeAddress(id);
            return user;
        }

        /// <summary>
        /// Persists changes to an existing user.
        /// </summary>
        /// <param name="user">Domain entity with the target <see cref="User.Id"/>.</param>
        /// <returns><see langword="false"/> when the ID does not exist; otherwise <see langword="true"/>.</returns>
        public bool Update(User user)
        {
            var existing = _unitOfWork.Users.GetById(user.Id);
            if (existing == null)
            {
                return false;
            }

            _unitOfWork.Users.Update(user);
            _unitOfWork.Complete();
            return true;
        }

        /// <summary>
        /// Removes a user by ID.
        /// </summary>
        /// <param name="id">Primary key of the user to delete.</param>
        /// <returns><see langword="false"/> when the ID does not exist; otherwise <see langword="true"/>.</returns>
        public bool Delete(int id)
        {
            var user = _unitOfWork.Users.GetById(id);
            if (user == null)
            {
                return false;
            }

            _unitOfWork.Users.Remove(user);
            _unitOfWork.Complete();
            return true;
        }

        /// <summary>
        /// Inserts a new user and commits the transaction.
        /// </summary>
        /// <param name="user">Domain entity to persist (duplicate <see cref="User.LoginName"/> is checked in the controller).</param>
        /// <returns>The persisted entity, including database-assigned identifiers.</returns>
        public User Add(User user)
        {
            _unitOfWork.Users.Add(user);
            _unitOfWork.Complete();
            return user;
        }

        /// <summary>
        /// Checks whether a <see cref="User.LoginName"/> is already taken.
        /// </summary>
        /// <param name="loginName">Unique login name to test.</param>
        /// <param name="excludeUserId">When updating, the current user's ID to exclude from the search.</param>
        /// <returns><see langword="true"/> when another user already uses the login name.</returns>
        public bool LoginNameExists(string loginName, int? excludeUserId = null)
        {
            if (string.IsNullOrWhiteSpace(loginName))
            {
                return false;
            }

            return _unitOfWork.Users
                .Find(u => u.LoginName == loginName && (!excludeUserId.HasValue || u.Id != excludeUserId.Value))
                .Any();
        }
    }
}