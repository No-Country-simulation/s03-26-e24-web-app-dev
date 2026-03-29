
using System.ComponentModel.DataAnnotations;

namespace CmsPro.Application.DTO
{
    public record PostTestimonialRequest(
        string Content, 
        string? ImageUrl, 
        string? VideoUrl,
        [Required]
        Guid authorId
    );
}
