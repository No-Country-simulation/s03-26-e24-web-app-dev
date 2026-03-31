using CmsPro.Domain.Entities;

namespace CmsPro.Application.DTO
{
    public record GetTestimonialResponse(
        string Content, 
        string? MultimediaUrl,
        string AuthorName,
        DateTime CreatedAt
    );

    public static class GetTestimonialResponseExtensions
    {
        extension(Testimonial testimonial)
        {
            public GetTestimonialResponse ToGetTestimonialResponse()
            {
                return new GetTestimonialResponse(
                    testimonial.Content,
                    testimonial.MultimediaUrl,
                    testimonial.AuthorName,
                    testimonial.CreatedAt
                );
            }
        }
    }
}
