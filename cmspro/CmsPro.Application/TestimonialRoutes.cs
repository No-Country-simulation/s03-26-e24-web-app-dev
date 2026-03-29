using CmsPro.Application.DTO;
using CmsPro.Application.Interfaces;
using CmsPro.Domain.Entities;

namespace CmsPro.API
{
    public class TestimonialRoutes
    {
        private ITestimonyRepository _repository;
        public TestimonialRoutes(ITestimonyRepository repository) {
            _repository = repository;
        }
        public async Task<GetTestimonialResponse> GetTestimonial(Guid id)
        {
            Testimonial testimonial = await _repository.GetTestimonial(id);

            return testimonial.ToGetTestimonialResponse();
        }

        public async Task<List<GetTestimonialResponse>> GetAllTestimonials(Guid id, string category)
        {
            List<Testimonial> testimonials = await _repository.GetTestimonials(id, category);
            return testimonials.Select(t => t.ToGetTestimonialResponse()).ToList();
        }

        public async Task CreateTestimonial(PostTestimonialRequest body)
        {
            await _repository.PostTestimonial(body);

            return;
        }

        public async Task UpdateTestimonial(Guid id, UpdateTestimonialRequest body)
        {
            await _repository.UpdateTestimonial(id, body);

            return;
        }
        public async Task DeleteTestimonial(Guid id)
        {
            await _repository.DeleteTestimonial(id);

            return;
        }
    }
}
