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

        [HttpGet]
        public IActionResult Get()
        {
            var users = _mapper.Map<List<UserResource>>(_usersService.GetAll().ToList());
            return Ok(users);
        }

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

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            if (!_usersService.Delete(id))
            {
                return NotFound();
            }

            return Ok();
        }

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