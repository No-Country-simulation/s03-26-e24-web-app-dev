using CmsPro.Domain.Entities;
using CmsPro.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace CmsPro.Application.DTO
{
    public record UpdateTestimonialRequest(
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

    public static class UpdateTestimonialRequestExtensions
    {
        public static void ApplyUpdate(this Testimonial request, UpdateTestimonialRequest body)
        {
            request.Content = body.Content;
            request.Format = body.Format;
            request.Status = body.Status;
            request.AuthorName = body.AuthorName;
            request.MultimediaUrl = body.MultimediaUrl;
            request.CategoryId = body.CategoryId;
        }
    }
}
