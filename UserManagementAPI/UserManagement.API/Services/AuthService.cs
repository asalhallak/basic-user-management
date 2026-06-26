using UserManagementAPI.Helpers;
using UserManagementAPI.Resources;

namespace UserManagementAPI.Services
{
    /// <summary>
    /// Development-only authentication that issues JWTs for hardcoded credentials.
    /// Login is not backed by database users; see docs/api-services.md and SECURITY.md.
    /// </summary>
    public class AuthService
    {
        private readonly JwtHelper _jwt;

        public AuthService(JwtHelper jwt)
        {
            _jwt = jwt;
        }

        /// <summary>
        /// Validates credentials and returns a signed JWT on success.
        /// Only <c>admin</c> / <c>123456789</c> are accepted in this sample.
        /// </summary>
        /// <param name="user">Login payload from POST /api/v1/auth/login.</param>
        /// <returns><see cref="Claims"/> with a token when credentials match; otherwise <see langword="null"/>.</returns>
        public Claims Login(Credentials user)
        {
            // Assume this will call auth servers
            // This Fake Auth
            if (user?.UserName == "admin" && user?.Password == "123456789")
            {
                var claims = new Claims {UserName = user.UserName};
                claims.Token = _jwt.GenerateToken(claims);
                return claims;
            }
            return null;
        }
    }
}