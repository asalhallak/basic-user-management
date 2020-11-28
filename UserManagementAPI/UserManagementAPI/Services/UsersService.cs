using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using AutoMapper;
using Domain.Entities;
using Domain.Interfaces;
using Microsoft.VisualBasic;
using UserManagementAPI.Models;

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
            return _unitOfWork.Users.GetAll();
        }
        public User Get(int id)
        {
            return _unitOfWork.Users.GetById(id);
        }
        public User Update(User user)
        {
            _unitOfWork.Users.Update(user);
            _unitOfWork.Complete();
            return user;
        }
        public void Delete(int id)
        {
            var user = _unitOfWork.Users.GetById(id);
            _unitOfWork.Users.Remove(user);
            _unitOfWork.Complete();
        }
        public void Add(User user)
        {
            _unitOfWork.Users.Add(user);
            _unitOfWork.Complete();
        }
    }
}