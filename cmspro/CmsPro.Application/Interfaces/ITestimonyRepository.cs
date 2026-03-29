using CmsPro.Application.DTO;
using CmsPro.Domain.Entities;

namespace CmsPro.Application.Interfaces
{
    public interface ITestimonyRepository
    {
        public Task<Testimonial> GetTestimonial(Guid id);
        public Task<List<Testimonial>> GetTestimonials(Guid id, string category);
        public Task<Testimonial> PostTestimonial(PostTestimonialRequest body);
        public Task<Testimonial> UpdateTestimonial(Guid id, UpdateTestimonialRequest body);
        public Task DeleteTestimonial(Guid id);
    }
}
