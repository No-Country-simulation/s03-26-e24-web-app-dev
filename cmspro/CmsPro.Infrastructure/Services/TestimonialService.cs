using CmsPro.Infrastructure.Persistence;
using CmsPro.Domain.Entities;
using CmsPro.Application.Interfaces;
using Microsoft.EntityFrameworkCore;
using CmsPro.Application.DTO;

namespace CmsPro.Infrastructure.Services
{
    public class TestimonialService : ITestimonyRepository
    {
        private readonly ApplicationDbContext _db;  
        public TestimonialService(ApplicationDbContext db)
        {
            _db = db;
        }
        public async Task<Testimonial> GetTestimonial(Guid id)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);
            
            if (testimonial is null)
            {
                throw new Exception($"Testimonial with id {id} not found.");
            }
            
            return testimonial;
        }

        public async Task<List<Testimonial>> GetTestimonials(Guid id, string category)
        {
            var list = await _db.Testimonials.Where(t => t.Id == id).ToListAsync();

            if (!String.IsNullOrEmpty(category))
            {
                list = list.Where(t => t.Category != null && t.Category.Name == category).ToList();
            }

            return list;
        }
        public async Task<Testimonial> PostTestimonial(PostTestimonialRequest body)
        {
            Testimonial newTestimonial = body.ToTestimonial();

            _db.Testimonials.Add(newTestimonial);
            await _db.SaveChangesAsync();
            return newTestimonial;
        }
        public async Task<Testimonial> UpdateTestimonial(Guid id, UpdateTestimonialRequest updatedTestimonial)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);
            
            if (testimonial is null)
            {
                //TODO: Crear custom exceptions
                throw new Exception($"Testimonial with id {id} not found.");
            }

            testimonial.ApplyUpdate(updatedTestimonial);
            await _db.SaveChangesAsync();
            return testimonial;
        }
        public async Task DeleteTestimonial(Guid id)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);

            if (testimonial is null)
                throw new Exception($"Testimonial with id {id} not found.");

            testimonial.IsDeleted = true;
            await _db.SaveChangesAsync();

            return;
        }
    }
}
