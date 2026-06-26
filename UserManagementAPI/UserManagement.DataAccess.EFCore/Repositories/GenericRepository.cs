using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.EFCore.Repositories
{
    /// <summary>
    /// EF Core implementation of <see cref="IGenericRepository{T}"/> for a single entity type.
    /// Changes are not persisted until <see cref="UnitOfWorks.UnitOfWork.Complete"/> is called.
    /// </summary>
    /// <typeparam name="T">Entity type backed by a <see cref="DbSet{TEntity}"/> in <see cref="ApplicationContext"/>.</typeparam>
    public class GenericRepository<T>: IGenericRepository<T> where T: class
    {
        protected readonly ApplicationContext _context;

        public GenericRepository(ApplicationContext context)
        {
            _context = context;
        }

        /// <inheritdoc />
        public void Add(T entity)
        {
            _context.Set<T>().Add(entity);
        }

        /// <inheritdoc />
        public void AddRange(IEnumerable<T> entities)
        {
            _context.Set<T>().AddRange(entities);
        }

        /// <inheritdoc />
        public void Update(T entity)
        {
            _context.Set<T>().Update(entity);
        }

        /// <inheritdoc />
        public IEnumerable<T> Find(Expression<Func<T, bool>> expression)
        {
            return _context.Set<T>().Where(expression);
        }

        /// <inheritdoc />
        public IEnumerable<T> GetAll()
        {
            return _context.Set<T>().ToList();
        }

        /// <inheritdoc />
        public T GetById(int id)
        {
            return _context.Set<T>().Find(id);
        }

        /// <inheritdoc />
        public void Remove(T entity)
        {
            _context.Set<T>().Remove(entity);
        }

        /// <inheritdoc />
        public void RemoveRange(IEnumerable<T> entities)
        {
            _context.Set<T>().RemoveRange(entities);
        }
    }
}
