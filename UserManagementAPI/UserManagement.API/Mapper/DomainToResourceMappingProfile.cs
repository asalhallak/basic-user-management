using AutoMapper;
using Domain.Entities;
using UserManagementAPI.Resources;

namespace UserManagementAPI.Mapper
{
    /// <summary>
    /// AutoMapper profile mapping between domain entities and API resource DTOs.
    /// Registered in <c>Startup.cs</c>; see docs/automapper-mapping.md.
    /// </summary>
    public class DomainToResourceMappingProfile : Profile
    {
        public DomainToResourceMappingProfile()
        {
            CreateMap<User, UserResource>();
            CreateMap<Address, AddressResource>();
            CreateMap<AddressResource, Address>();
            CreateMap<UserResource, User>();
        }
    }
}
