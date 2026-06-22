using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.VisualBasic;

namespace UserManagementAPI.Services
{
    public class UsersService
    {
        private readonly IUnitOfWork _unitOfWork;
        public UsersService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public IEnumerable<User> GetAll()
        {
            return _unitOfWork.Users.GetAllIncludeAddress();
        }
        public User Get(int id)
        {
            var user = _unitOfWork.Users.GetIncludeAddress(id);
            return user;
        }
        public bool Update(User user)
        {
            var existing = _unitOfWork.Users.GetById(user.Id);
            if (existing == null)
            {
                return false;
            }

            _unitOfWork.Users.Update(user);
            _unitOfWork.Complete();
            return true;
        }
        public bool Delete(int id)
        {
            var user = _unitOfWork.Users.GetById(id);
            if (user == null)
            {
                return false;
            }

            _unitOfWork.Users.Remove(user);
            _unitOfWork.Complete();
            return true;
        }
        public User Add(User user)
        {
            _unitOfWork.Users.Add(user);
            _unitOfWork.Complete();
            return user;
        }
    }
}