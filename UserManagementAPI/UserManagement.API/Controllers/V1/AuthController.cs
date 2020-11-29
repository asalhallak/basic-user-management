using Microsoft.AspNetCore.Mvc;
using UserManagementAPI.Resources;
using UserManagementAPI.Services;

namespace UserManagementAPI.Controllers.V1
{
    [Route("api/v1/auth")]
    [ApiController]
    public class AuthController: ControllerBase
    {
        private readonly AuthService _auth;
        public AuthController(AuthService auth)
        {
            _auth = auth;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] Credentials credentials)
        {
           var res = _auth.Login(credentials);
           if (res != null) return Ok(res);
           return Unauthorized();
        }
    }
}