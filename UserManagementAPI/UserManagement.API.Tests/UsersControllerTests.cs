using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using UserManagementAPI.Controllers.V1;
using UserManagementAPI.Mapper;
using UserManagementAPI.Resources;
using UserManagementAPI.Services;
using Xunit;

namespace UserManagementAPI.Tests
{
    public class UsersControllerTests
    {
        private static UsersController CreateController(out FakeUnitOfWork unitOfWork)
        {
            unitOfWork = new FakeUnitOfWork();
            var usersService = new UsersService(unitOfWork);
            var mapper = new MapperConfiguration(cfg => cfg.AddProfile<DomainToResourceMappingProfile>())
                .CreateMapper();
            return new UsersController(usersService, mapper);
        }

        [Fact]
        public void Get_ReturnsOkWithMappedUsers()
        {
            var controller = CreateController(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 1, LoginName = "jdoe", DisplayName = "Jane Doe" });

            var result = controller.Get();

            var ok = Assert.IsType<OkObjectResult>(result);
            var users = Assert.IsAssignableFrom<List<UserResource>>(ok.Value);
            Assert.Single(users);
            Assert.Equal("jdoe", users[0].LoginName);
        }

        [Fact]
        public void GetById_ExistingUser_ReturnsOkWithUserResource()
        {
            var controller = CreateController(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 2, LoginName = "asmith", DisplayName = "Alice Smith" });

            var result = controller.Get(2);

            var ok = Assert.IsType<OkObjectResult>(result);
            var user = Assert.IsType<UserResource>(ok.Value);
            Assert.Equal("asmith", user.LoginName);
        }

        [Fact]
        public void GetById_MissingUser_ReturnsNotFound()
        {
            var controller = CreateController(out _);

            var result = controller.Get(999);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void Add_NewUser_ReturnsOkWithUserResource()
        {
            var controller = CreateController(out _);
            var resource = new UserResource { LoginName = "newuser", DisplayName = "New User" };

            var result = controller.Add(resource);

            var ok = Assert.IsType<OkObjectResult>(result);
            var created = Assert.IsType<UserResource>(ok.Value);
            Assert.Equal("newuser", created.LoginName);
            Assert.Equal("New User", created.DisplayName);
        }

        [Fact]
        public void Add_DuplicateLoginName_ReturnsConflict()
        {
            var controller = CreateController(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 1, LoginName = "jdoe", DisplayName = "Jane Doe" });
            var resource = new UserResource { LoginName = "jdoe", DisplayName = "Duplicate" };

            var result = controller.Add(resource);

            var conflict = Assert.IsType<ConflictObjectResult>(result);
            Assert.NotNull(conflict.Value);
        }

        [Fact]
        public void Delete_ExistingUser_ReturnsOk()
        {
            var controller = CreateController(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 5, LoginName = "todelete", DisplayName = "Delete Me" });

            var result = controller.Delete(5);

            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public void Delete_MissingUser_ReturnsNotFound()
        {
            var controller = CreateController(out _);

            var result = controller.Delete(999);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void Update_ExistingUser_ReturnsOk()
        {
            var controller = CreateController(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 3, LoginName = "jdoe", DisplayName = "Jane Doe" });
            var resource = new UserResource { LoginName = "jdoe", DisplayName = "Jane Smith" };

            var result = controller.Update(3, resource);

            Assert.IsType<OkResult>(result);
        }

        [Fact]
        public void Update_MissingUser_ReturnsNotFound()
        {
            var controller = CreateController(out _);
            var resource = new UserResource { LoginName = "ghost", DisplayName = "Ghost" };

            var result = controller.Update(404, resource);

            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public void Update_DuplicateLoginName_ReturnsConflict()
        {
            var controller = CreateController(out var unitOfWork);
            unitOfWork.Users.Seed(new User { Id = 1, LoginName = "jdoe", DisplayName = "Jane Doe" });
            unitOfWork.Users.Seed(new User { Id = 2, LoginName = "asmith", DisplayName = "Alice Smith" });
            var resource = new UserResource { LoginName = "jdoe", DisplayName = "Alice tries jdoe" };

            var result = controller.Update(2, resource);

            var conflict = Assert.IsType<ConflictObjectResult>(result);
            Assert.NotNull(conflict.Value);
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
