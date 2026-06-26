using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace Domain.Interfaces
{
    /// <summary>
    /// Generic CRUD contract for a single entity type.
    /// Implemented by <c>GenericRepository&lt;T&gt;</c> in the EF Core data-access layer.
    /// </summary>
    /// <typeparam name="T">Entity type managed by this repository.</typeparam>
    public interface IGenericRepository<T> where T : class
    {
        /// <summary>Returns the entity with the given primary key, or <see langword="null"/> when not found.</summary>
        T GetById(int id);

        /// <summary>Returns all entities of type <typeparamref name="T"/>.</summary>
        IEnumerable<T> GetAll();

        /// <summary>Returns entities matching the given predicate.</summary>
        IEnumerable<T> Find(Expression<Func<T, bool>> expression);

        /// <summary>Stages a new entity for insert on the next <see cref="IUnitOfWork.Complete"/>.</summary>
        void Add(T entity);

        /// <summary>Stages multiple new entities for insert on the next <see cref="IUnitOfWork.Complete"/>.</summary>
        void AddRange(IEnumerable<T> entities);

        /// <summary>Stages an entity for update on the next <see cref="IUnitOfWork.Complete"/>.</summary>
        void Update(T entity);

        /// <summary>Stages an entity for delete on the next <see cref="IUnitOfWork.Complete"/>.</summary>
        void Remove(T entity);

        /// <summary>Stages multiple entities for delete on the next <see cref="IUnitOfWork.Complete"/>.</summary>
        void RemoveRange(IEnumerable<T> entities);
    }
}
