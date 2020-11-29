using System.Diagnostics.Eventing.Reader;
using Microsoft.AspNetCore.Mvc;
using UserManagementAPI.Resources;
using UserManagementAPI.Services;

namespace UserManagementAPI.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController: ControllerBase
    {
        private readonly AuthService _auth;
        public AuthController(AuthService auth)
        {
            _auth = auth;
        }

        [HttpGet("login")]
        public IActionResult Login([FromBody] Credentials credentials)
        {
           var res = _auth.Login(credentials);
           if (res != null) return Ok(res);
           return Unauthorized();
        }
    }
}