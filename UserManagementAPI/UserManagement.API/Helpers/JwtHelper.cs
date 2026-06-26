using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using UserManagementAPI.Resources;

namespace UserManagementAPI.Helpers
{
    /// <summary>
    /// Signs JWT bearer tokens using the <c>JwtSecret</c> value from configuration.
    /// Tokens expire after seven days (see README configuration reference).
    /// </summary>
    public class JwtHelper
    {
        private readonly IConfiguration _configuration;

        public JwtHelper(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Creates a signed JWT with a <see cref="ClaimTypes.Name"/> claim for the given user.
        /// </summary>
        /// <param name="user">Claims payload containing the authenticated user name.</param>
        /// <returns>Compact JWT string suitable for <c>Authorization: Bearer</c> headers.</returns>
        public string GenerateToken(Claims user)
        {
            
            var tokenHandler = new JwtSecurityTokenHandler();
            
            var key = Encoding.ASCII.GetBytes(_configuration["JwtSecret"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
              
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.UserName )
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return  tokenHandler.WriteToken(token);
        }
    }
}