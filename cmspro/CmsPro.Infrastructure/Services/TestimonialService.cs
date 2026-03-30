using CmsPro.Application.DTO;
using CmsPro.Application.Interfaces;
using CmsPro.Domain.Entities;
using CmsPro.Infrastructure.Persistence;
using ErrorOr;

namespace CmsPro.Infrastructure.Services
{
    public class TestimonialService : ITestimonyRepository
    {
        private readonly ApplicationDbContext _db;  
        public TestimonialService(ApplicationDbContext db)
        {
            _db = db;
        }
        public async Task<ErrorOr<Testimonial>> GetTestimonial(Guid id)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);
            
            if (testimonial is null)
                return Error.NotFound($"Testimonial with id {id} not found.");

            return testimonial;
        }

        public async Task<ErrorOr<List<Testimonial>>> GetTestimonials(string category)
        {
            var list = _db.Testimonials.Where(t => t.Category != null && t.Category.Name.ToLower() == category.ToLower()).ToList();
             
            return list;
        }
        public async Task<ErrorOr<Testimonial>> PostTestimonial(PostTestimonialRequest body)
        {
            Testimonial newTestimonial = body.ToTestimonial();

            _db.Testimonials.Add(newTestimonial);
            await _db.SaveChangesAsync();
            return newTestimonial;
        }
        public async Task<ErrorOr<Testimonial>> UpdateTestimonial(Guid id, UpdateTestimonialRequest updatedTestimonial)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);

            if (testimonial is null || testimonial.IsDeleted)
                return Error.NotFound($"Testimonial with id {id} not found.");

            testimonial.ApplyUpdate(updatedTestimonial);
            await _db.SaveChangesAsync();
            return testimonial;
        }
        public async Task<ErrorOr<Deleted>> DeleteTestimonial(Guid id)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);

            if (testimonial is null || testimonial.IsDeleted)
                return Error.NotFound($"Testimonial with id {id} not found.");

            testimonial.IsDeleted = true;
            await _db.SaveChangesAsync();

            return Result.Deleted;
        }
    }
}
