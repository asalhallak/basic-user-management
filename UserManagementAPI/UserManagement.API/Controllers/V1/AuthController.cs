using Microsoft.AspNetCore.Mvc;
using UserManagementAPI.Resources;
using UserManagementAPI.Services;

namespace UserManagementAPI.Controllers.V1
{
    /// <summary>
    /// Public authentication endpoints under <c>/api/v1/auth</c>.
    /// Issues JWTs via <see cref="AuthService"/>; not protected by <see cref="AuthorizeAttribute"/>.
    /// </summary>
    [Route("api/v1/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _auth;

        public AuthController(AuthService auth)
        {
            _auth = auth;
        }

        /// <summary>
        /// Exchanges credentials for a signed JWT.
        /// </summary>
        /// <param name="credentials">Login payload (<c>userName</c>, <c>password</c>).</param>
        /// <returns><see cref="Claims"/> with a token on success; <see cref="UnauthorizedResult"/> otherwise.</returns>
        [HttpPost("login")]
        public IActionResult Login([FromBody] Credentials credentials)
        {
            var res = _auth.Login(credentials);
            if (res != null) return Ok(res);
            return Unauthorized();
        }
    }
}
