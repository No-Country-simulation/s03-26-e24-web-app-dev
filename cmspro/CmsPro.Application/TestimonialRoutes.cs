using CmsPro.Application.DTO;
using CmsPro.Application.Interfaces;
using CmsPro.Domain.Entities;
using ErrorOr;

namespace CmsPro.API
{
    public class TestimonialRoutes
    {
        private ITestimonyRepository _repository;
        public TestimonialRoutes(ITestimonyRepository repository) {
            _repository = repository;
        }
        public async Task<ErrorOr<GetTestimonialResponse>> GetTestimonial(Guid id)
        {
            var result = await _repository.GetTestimonial(id);

            return result.IsError
                ? result.Errors
                : result.Value.ToGetTestimonialResponse();
        }

        public async Task<ErrorOr<List<GetTestimonialResponse>>> GetAllTestimonials(Guid id, string category)
        {
            var result = await _repository.GetTestimonials(id, category);

            return result.IsError
                ? result.Errors
                : result.Value.Select(t => t.ToGetTestimonialResponse()).ToList();
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
