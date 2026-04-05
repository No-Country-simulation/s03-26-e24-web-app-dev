namespace CmsPro.Domain.Entities;

public class MediaAsset
{
    public Guid Id { get; set; }
    public Guid TestimonialId { get; set; }
    public string MediaType { get; set; } = null!;
    public string Provider { get; set; } = null!;
    public string Url { get; set; } = null!;
    public string? PublicId { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // RELACIONES
    public virtual Testimonial Testimonial { get; set; } = null!;
}
