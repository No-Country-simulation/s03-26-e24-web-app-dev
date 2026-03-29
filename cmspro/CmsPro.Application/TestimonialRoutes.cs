using CmsPro.Application.DTO;
using CmsPro.Application.Interfaces;
using CmsPro.Domain.Entities;

namespace CmsPro.API
{
    public static class TestimonialRoutes
    {
        public static async Task<GetTestimonialResponse> GetTestimonial(Guid id, ITestimonyRepository service)
        {
            Testimonial testimonial = await service.GetTestimonial(id);

            return testimonial.ToGetTestimonialResponse();
        }

        public static async Task CreateTestimonial(PostTestimonialRequest body, ITestimonyRepository service)
        {
            await service.PostTestimonial(body);

            return;
        }

        public static async Task UpdateTestimonial(Guid id, UpdateTestimonialRequest body, ITestimonyRepository service)
        {
            await service.UpdateTestimonial(id, body);

            return;
        }

        public static async Task DeleteTestimonial(Guid id, ITestimonyRepository service)
        {
            await service.DeleteTestimonial(id);

            return;
        }
    }
}
