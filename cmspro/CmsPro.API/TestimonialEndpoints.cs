namespace CmsPro.API
{
    public static class TestimonialEndpoints
    {
        extension(WebApplication app) {
            public void MapTestimonial()
            {
                var group = app.MapGroup("/testimonial");

                group.MapGet("/{id}", (Guid id) => TestimonialRoutes.GetTestimonial);
                group.MapPost("/", () => TestimonialRoutes.CreateTestimonial);
                group.MapPut("/{id}", (Guid id) => TestimonialRoutes.UpdateTestimonial);
                group.MapDelete("/{id}", (Guid id) => TestimonialRoutes.DeleteTestimonial);
            }
        }
    }
}
