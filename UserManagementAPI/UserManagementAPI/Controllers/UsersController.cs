using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;
using UserManagementAPI.Models;
using UserManagementAPI.Services;

namespace UserManagementAPI.Controllers
{
    [Route("api/users")]
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
            var users = _mapper.Map<UserResource>(_usersService.Get(id));
            return Ok(users);
        }

        [HttpPost]
        public IActionResult Add([FromBody] UserResource user)
        {
            _usersService.Add(_mapper.Map<User>(user));
            return Ok();
        }

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            _usersService.Delete(id);
            return Ok();
        }

        [HttpPut]
        public IActionResult Update([FromBody] UserResource user)
        {
            _usersService.Update(_mapper.Map<User>(user));
            return Ok();
        }
    }
}