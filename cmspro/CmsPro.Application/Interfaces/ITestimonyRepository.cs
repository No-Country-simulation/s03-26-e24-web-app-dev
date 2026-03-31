using CmsPro.Application.DTO;
using CmsPro.Domain.Entities;
using ErrorOr;

namespace CmsPro.Application.Interfaces
{
    public interface ITestimonyRepository
    {
        public Task<ErrorOr<Testimonial>> GetTestimonial(Guid id);
        public Task<ErrorOr<List<Testimonial>>> GetTestimonials(string category);
        public Task<ErrorOr<Testimonial>> PostTestimonial(PostTestimonialRequest body);
        public Task<ErrorOr<Testimonial>> UpdateTestimonial(Guid id, UpdateTestimonialRequest body);
        public Task<ErrorOr<Deleted>> DeleteTestimonial(Guid id);
    }
}
