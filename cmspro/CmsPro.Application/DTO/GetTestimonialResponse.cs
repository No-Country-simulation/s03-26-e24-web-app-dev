using CmsPro.Domain.Entities;

namespace CmsPro.Application.DTO
{
    public record GetTestimonialResponse(
        string Content, 
        string? ImageUrl, 
        string? VideoUrl
    );

    public static class GetTestimonialResponseExtensions
    {
        extension(Testimonial testimonial)
        {
            public GetTestimonialResponse ToGetTestimonialResponse()
            {
                return new GetTestimonialResponse(
                    testimonial.Content,
                    testimonial.ImageUrl,
                    testimonial.VideoUrl
                );
            }
        }
    }
}
