using CmsPro.Application.DTO;
using ErrorOr;

namespace CmsPro.API
{
    public static class TestimonialEndpoints
    {
        extension(WebApplication app)
        {
            public void MapTestimonial()
            {
                var group = app.MapGroup("/testimonials");

                group.MapGet("/{id}", GetTestimonial);
                group.MapGet("/", GetAllTestimonials);
                group.MapPost("/", CreateTestimonial);
                group.MapPut("/{id}", UpdateTestimonial);
                group.MapDelete("/{id}", DeleteTestimonial);
            }
        }
        private static async Task<IResult> GetTestimonial(Guid id, TestimonialRoutes routes)
        {
            var result = await routes.GetTestimonial(id);

            return result.Match(
                testimonial => TypedResults.Ok(testimonial),
                errors => Results.Problem(result.Errors[0].Description));
        }
        private static async Task<IResult> GetAllTestimonials(string category, TestimonialRoutes routes)
        {
            var result = await routes.GetAllTestimonials(category);

            return result.Match(
                testimonials => TypedResults.Ok(testimonials),
                errors => Results.Problem(result.Errors[0].Description));
        }
        private static async Task<IResult> CreateTestimonial(PostTestimonialRequest body, TestimonialRoutes routes)
        {
            var result = await routes.CreateTestimonial(body);

            return result.Match(
                testimonials => TypedResults.Ok(testimonials),
                errors => Results.Problem(result.Errors[0].Description));
        }
        private static async Task<IResult> UpdateTestimonial(Guid id, UpdateTestimonialRequest body, TestimonialRoutes routes)
        {
           var result = await routes.UpdateTestimonial(id, body);

            return result.Match(
                testimonials => TypedResults.Ok(testimonials),
                errors => Results.Problem(result.Errors[0].Description));
        }
        private static async Task<IResult> DeleteTestimonial(Guid id, TestimonialRoutes routes)
        {
            var result = await routes.DeleteTestimonial(id);

            return result.Match(
                testimonials => TypedResults.NoContent(),
                errors => Results.Problem(result.Errors[0].Code, statusCode: 404));
        }
    }
}
