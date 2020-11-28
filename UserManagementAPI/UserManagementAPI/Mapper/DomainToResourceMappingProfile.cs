using AutoMapper;
using Domain.Entities;
using UserManagementAPI.Models;

namespace UserManagementAPI.Mapper
{
    public class DomainToResourceMappingProfile : Profile
    {
        public DomainToResourceMappingProfile()
        {
            CreateMap<User, UserResource>();
            CreateMap<Address, AddressResource>();
        }
    }
}