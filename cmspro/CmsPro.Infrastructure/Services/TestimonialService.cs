using CmsPro.Infrastructure.Persistence;
using CmsPro.Domain.Entities;   

namespace CmsPro.Infrastructure.Services
{
    public class TestimonialService 
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
        public async Task<Testimonial> CreateTestimonial(Testimonial testimonial)
        {
            _db.Testimonials.Add(testimonial);
            await _db.SaveChangesAsync();
            return testimonial;
        }

        public async Task<Testimonial> UpdateTestimonial(Guid id, Testimonial updatedTestimonial)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);
            
            if (testimonial is null)
            {
                //TODO: Crear custom exceptions
                throw new Exception($"Testimonial with id {id} not found.");
            }

            testimonial = updatedTestimonial;
            await _db.SaveChangesAsync();
            return testimonial;
        }

        public async void DeleteTestimonial(Guid id)
        {
            var testimonial = await _db.Testimonials.FindAsync(id);

            if (testimonial is null)
                throw new Exception($"Testimonial with id {id} not found.");

            testimonial.IsDeleted = true;

            return;
        }
    }
}
