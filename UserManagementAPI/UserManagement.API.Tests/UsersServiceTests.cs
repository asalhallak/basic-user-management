using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Domain.Entities;
using Domain.Interfaces;
using UserManagementAPI.Services;
using Xunit;

namespace UserManagementAPI.Tests
{
    public class UsersServiceTests
    {
        private static UsersService CreateService(out FakeUnitOfWork unitOfWork)
        {
            unitOfWork = new FakeUnitOfWork();
            return new UsersService(unitOfWork);
        }

        [Fact]
        public void GetAll_ReturnsUsersFromRepository()
        {
            var service = CreateService(out var unitOfWork);
            var user = new User { Id = 1, LoginName = "jdoe", DisplayName = "Jane Doe" };
            unitOfWork.Users.Seed(user);

            var result = service.GetAll().ToList();

            Assert.Single(result);
            Assert.Equal("jdoe", result[0].LoginName);
        }

        [Fact]
        public void Get_ExistingId_ReturnsUser()
        {
            var service = CreateService(out var unitOfWork);
            var user = new User { Id = 2, LoginName = "asmith", DisplayName = "Alice Smith" };
            unitOfWork.Users.Seed(user);

            var result = service.Get(2);

            Assert.NotNull(result);
            Assert.Equal("asmith", result.LoginName);
        }

        [Fact]
        public void Get_MissingId_ReturnsNull()
        {
            var service = CreateService(out _);

            Assert.Null(service.Get(999));
        }

        [Fact]
        public void Add_PersistsUserAndReturnsEntity()
        {
            var service = CreateService(out var unitOfWork);
            var user = new User { LoginName = "newuser", DisplayName = "New User" };

            var result = service.Add(user);

            Assert.Equal("newuser", result.LoginName);
            Assert.Equal(1, unitOfWork.CompleteCallCount);
            Assert.Single(unitOfWork.Users.GetAll());
        }

        [Fact]
        public void Update_ExistingUser_ReturnsTrueAndPersists()
        {
            var service = CreateService(out var unitOfWork);
            var user = new User { Id = 3, LoginName = "jdoe", DisplayName = "Jane Doe" };
            unitOfWork.Users.Seed(user);
            user.DisplayName = "Jane Smith";

            var updated = service.Update(user);

            Assert.True(updated);
            Assert.Equal(1, unitOfWork.CompleteCallCount);
            Assert.Equal("Jane Smith", unitOfWork.Users.GetById(3).DisplayName);
        }

        [Fact]
        public void Update_MissingUser_ReturnsFalse()
        {
            var service = CreateService(out var unitOfWork);
            var user = new User { Id = 404, LoginName = "ghost", DisplayName = "Ghost" };

            var updated = service.Update(user);

            Assert.False(updated);
            Assert.Equal(0, unitOfWork.CompleteCallCount);
        }

        [Fact]
        public void Delete_ExistingUser_ReturnsTrueAndRemoves()
        {
            var service = CreateService(out var unitOfWork);
            var user = new User { Id = 5, LoginName = "todelete", DisplayName = "Delete Me" };
            unitOfWork.Users.Seed(user);

            var deleted = service.Delete(5);

            Assert.True(deleted);
            Assert.Equal(1, unitOfWork.CompleteCallCount);
            Assert.Empty(unitOfWork.Users.GetAll());
        }

        [Fact]
        public void Delete_MissingUser_ReturnsFalse()
        {
            var service = CreateService(out var unitOfWork);

            var deleted = service.Delete(999);

            Assert.False(deleted);
            Assert.Equal(0, unitOfWork.CompleteCallCount);
        }

        [Fact]
        public void LoginNameExists_WhenNameTaken_ReturnsTrue()
        {
            var service = CreateService(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 1, LoginName = "jdoe", DisplayName = "Jane Doe" });

            Assert.True(service.LoginNameExists("jdoe"));
        }

        [Fact]
        public void LoginNameExists_WhenNameAvailable_ReturnsFalse()
        {
            var service = CreateService(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 1, LoginName = "jdoe", DisplayName = "Jane Doe" });

            Assert.False(service.LoginNameExists("other"));
        }

        [Fact]
        public void LoginNameExists_WithExcludeUserId_IgnoresSameUser()
        {
            var service = CreateService(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 1, LoginName = "jdoe", DisplayName = "Jane Doe" });

            Assert.False(service.LoginNameExists("jdoe", excludeUserId: 1));
        }

        [Fact]
        public void LoginNameExists_WithBlankName_ReturnsFalse()
        {
            var service = CreateService(out _);

            Assert.False(service.LoginNameExists(null));
            Assert.False(service.LoginNameExists(""));
            Assert.False(service.LoginNameExists("   "));
        }

        private sealed class FakeUnitOfWork : IUnitOfWork
        {
            public FakeUnitOfWork()
            {
                Users = new FakeUserRepository();
            }

            public FakeUserRepository Users { get; }
            IUserRepository IUnitOfWork.Users => Users;
            public IAddressRepository Addresses => throw new NotImplementedException();
            public int CompleteCallCount { get; private set; }

            public int Complete()
            {
                CompleteCallCount++;
                return 1;
            }

            public void Dispose()
            {
            }
        }

        private sealed class FakeUserRepository : IUserRepository
        {
            private readonly List<User> _users = new List<User>();
            private int _nextId = 1;

            public void Seed(User user)
            {
                if (user.Id == 0)
                {
                    user.Id = _nextId++;
                }
                _users.Add(user);
            }

            public IEnumerable<User> GetAllIncludeAddress() => _users.ToList();

            public User GetIncludeAddress(int id) => _users.FirstOrDefault(u => u.Id == id);

            public User GetById(int id) => _users.FirstOrDefault(u => u.Id == id);

            public IEnumerable<User> GetAll() => _users.ToList();

            public IEnumerable<User> Find(Expression<Func<User, bool>> expression) =>
                _users.AsQueryable().Where(expression);

            public void Add(User entity)
            {
                if (entity.Id == 0)
                {
                    entity.Id = _nextId++;
                }
                _users.Add(entity);
            }

            public void AddRange(IEnumerable<User> entities)
            {
                foreach (var entity in entities)
                {
                    Add(entity);
                }
            }

            public void Update(User entity)
            {
                var index = _users.FindIndex(u => u.Id == entity.Id);
                if (index >= 0)
                {
                    _users[index] = entity;
                }
            }

            public void Remove(User entity) => _users.RemoveAll(u => u.Id == entity.Id);

            public void RemoveRange(IEnumerable<User> entities)
            {
                foreach (var entity in entities)
                {
                    Remove(entity);
                }
            }
        }
    }
}
