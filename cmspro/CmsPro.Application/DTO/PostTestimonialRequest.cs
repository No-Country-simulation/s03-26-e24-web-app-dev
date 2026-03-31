
using CmsPro.Domain.Entities;
using CmsPro.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace CmsPro.Application.DTO
{
    public record PostTestimonialRequest(
        [Required]
        string Content,
        MultimediaType Format,
        [Required]
        TestimonialStatus Status,
        string? MultimediaUrl,
        [Required]
        string AuthorName,
        [Required]
        Guid CategoryId
    );

    public static class PostTestimonialRequestExtensions
    {
        public static Testimonial ToTestimonial(this PostTestimonialRequest request)
        {
            return new Testimonial(
                request.AuthorName,
                request.Content,
                request.CategoryId,
                request.Format,
                request.MultimediaUrl
            )
            {
                Status = request.Status
            };
        }
    }
}