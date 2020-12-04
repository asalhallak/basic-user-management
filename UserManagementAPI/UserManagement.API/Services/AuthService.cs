using UserManagementAPI.Helpers;
using UserManagementAPI.Resources;

namespace UserManagementAPI.Services
{
    public class AuthService
    {
        private readonly JwtHelper _jwt;

        public AuthService( JwtHelper jwt)
        {
            _jwt = jwt;
        }
        
        public Claims Login(Credentials user)
        {
            // Assume this will call auth servers
            // This Fake Auth
            if (user?.UserName == "admin" && user.Password == "123456789")
            {
                var claims = new Claims {UserName = user.UserName};
                claims.Token = _jwt.GenerateToken(claims);
                return claims;
            }
            return null;
        }
    }
}