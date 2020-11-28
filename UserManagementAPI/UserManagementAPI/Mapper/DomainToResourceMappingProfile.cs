using AutoMapper;
using Domain.Entities;
using UserManagementAPI.Resources;

namespace UserManagementAPI.Mapper
{
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