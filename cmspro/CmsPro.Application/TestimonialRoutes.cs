using CmsPro.Application.DTO;
using CmsPro.Application.Interfaces;
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

        public async Task<ErrorOr<List<GetTestimonialResponse>>> GetAllTestimonials(string category)
        {
            var result = await _repository.GetTestimonials(category);

            return result.IsError
                ? result.Errors
                : result.Value.Select(t => t.ToGetTestimonialResponse()).ToList();
        }

        public async Task<ErrorOr<GetTestimonialResponse>> CreateTestimonial(PostTestimonialRequest body)
        {
            var result = await _repository.PostTestimonial(body);

            return result.IsError
                ? result.Errors
                : result.Value.ToGetTestimonialResponse();
        }

        public async Task<ErrorOr<GetTestimonialResponse>> UpdateTestimonial(Guid id, UpdateTestimonialRequest body)
        {
            var result = await _repository.UpdateTestimonial(id, body);

            return result.IsError
                ? result.Errors
                : result.Value.ToGetTestimonialResponse();
        }
        public async Task<ErrorOr<Deleted>> DeleteTestimonial(Guid id)
        {
            var result = await _repository.DeleteTestimonial(id);

            return result;
        }
    }
}
