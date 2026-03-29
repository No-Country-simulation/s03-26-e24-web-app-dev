namespace CmsPro.Application.DTO
{
    public record UpdateTestimonialRequest(
        string Content, 
        string? ImageUrl, 
        string? VideoUrl,
        Guid authorId
    );
}
