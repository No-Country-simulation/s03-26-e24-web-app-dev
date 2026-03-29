using CmsPro.Application.DTO;
using CmsPro.Domain.Entities;

namespace CmsPro.Application.Interfaces
{
    public interface ITestimonyRepository
    {
        public Task<Testimonial> GetTestimonial(Guid id);
        public Task<List<Testimonial>> GetTestimonials();
        public Task PostTestimonial(PostTestimonialRequest body);
        public Task UpdateTestimonial(Guid id, UpdateTestimonialRequest body);
        public Task DeleteTestimonial(Guid id);
    }
}
