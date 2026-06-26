using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserManagementAPI.Resources;
using UserManagementAPI.Services;

namespace UserManagementAPI.Controllers.V1
{
    /// <summary>
    /// Protected user CRUD endpoints under <c>/api/v1/users</c>.
    /// Maps between <see cref="UserResource"/> DTOs and domain entities via <see cref="IMapper"/>.
    /// </summary>
    [Route("api/v1/users")]
    [Authorize]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly UsersService _usersService;
        private readonly IMapper _mapper;

        public UsersController(UsersService usersService,
            IMapper mapper)
        {
            _usersService = usersService;
            _mapper = mapper;
        }

        /// <summary>
        /// Lists all user records with nested addresses.
        /// </summary>
        /// <returns><see cref="OkObjectResult"/> containing an array of <see cref="UserResource"/>.</returns>
        [HttpGet]
        public IActionResult Get()
        {
            var users = _mapper.Map<List<UserResource>>(_usersService.GetAll().ToList());
            return Ok(users);
        }

        /// <summary>
        /// Returns a single user by primary key.
        /// </summary>
        /// <param name="id">User ID from the route.</param>
        /// <returns><see cref="UserResource"/> on success; <see cref="NotFoundResult"/> when missing.</returns>
        [HttpGet("{id}")]
        public IActionResult Get(int id)
        {
            var user = _usersService.Get(id);
            if (user == null)
            {
                return NotFound();
            }

            return Ok(_mapper.Map<UserResource>(user));
        }

        /// <summary>
        /// Creates a new user record.
        /// </summary>
        /// <param name="user">Request body mapped to a domain <see cref="User"/>.</param>
        /// <returns>Created <see cref="UserResource"/>; <see cref="ConflictObjectResult"/> when <c>loginName</c> is taken.</returns>
        [HttpPost]
        public IActionResult Add([FromBody] UserResource user)
        {
            if (_usersService.LoginNameExists(user?.LoginName))
            {
                return Conflict(new { message = "A user with this loginName already exists." });
            }

            var created = _usersService.Add(_mapper.Map<User>(user));
            return Ok(_mapper.Map<UserResource>(created));
        }

        /// <summary>
        /// Deletes a user by primary key.
        /// </summary>
        /// <param name="id">User ID from the route.</param>
        /// <returns><see cref="OkResult"/> on success; <see cref="NotFoundResult"/> when missing.</returns>
        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_usersService.Delete(id))
            {
                return NotFound();
            }

            return Ok();
        }

        /// <summary>
        /// Updates an existing user. The route <paramref name="id"/> is applied to the body before mapping.
        /// </summary>
        /// <param name="id">User ID from the route.</param>
        /// <param name="user">Updated fields in <see cref="UserResource"/> shape.</param>
        /// <returns><see cref="OkResult"/> on success; <see cref="NotFoundResult"/> when missing; <see cref="ConflictObjectResult"/> when <c>loginName</c> is taken.</returns>
        [HttpPut("{id}")]
        public IActionResult Update(int id, [FromBody] UserResource user)
        {
            user.Id = id;
            if (_usersService.LoginNameExists(user?.LoginName, id))
            {
                return Conflict(new { message = "A user with this loginName already exists." });
            }

            if (!_usersService.Update(_mapper.Map<User>(user)))
            {
                return NotFound();
            }

            return Ok();
        }
    }
}
