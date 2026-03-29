using CmsPro.Application.DTO;

namespace CmsPro.API
{
    public static class TestimonialEndpoints
    {
        extension(WebApplication app)
        {
            public void MapTestimonial()
            {
                var group = app.MapGroup("/testimonials");

                group.MapGet("/", (Guid id, string category = "") => GetAllTestimonials);
                group.MapPost("/", (PostTestimonialRequest body) => CreateTestimonial);
                group.MapPut("/{id}", (Guid id) => UpdateTestimonial);
                group.MapDelete("/{id}", (Guid id) => DeleteTestimonial);
            }
        }
        private static async Task<IResult> GetAllTestimonials(Guid id, string category, TestimonialRoutes routes)
        {
            var list = await routes.GetAllTestimonials(id, category);

            return TypedResults.Ok(list);
        }
        private static async Task<IResult> CreateTestimonial(PostTestimonialRequest body, TestimonialRoutes routes)
        {
            await routes.CreateTestimonial(body);
            return TypedResults.Ok();
        }
        private static async Task<IResult> UpdateTestimonial(Guid id, UpdateTestimonialRequest body, TestimonialRoutes routes)
        {
            await routes.UpdateTestimonial(id, body);
            return TypedResults.Ok();
        }
        private static async Task<IResult> DeleteTestimonial(Guid id, TestimonialRoutes routes)
        {
            await routes.DeleteTestimonial(id);
            return TypedResults.Ok();
        }
    }
}
