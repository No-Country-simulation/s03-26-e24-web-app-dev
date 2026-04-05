namespace CmsPro.Domain.Entities;

public class TestimonialCopyMediaAsset
{
    public Guid Id { get; set; }
    public Guid TestimonialCopyId { get; set; } // FK a la copia
    public string MediaType { get; set; } = null!;
    public string Provider { get; set; } = null!;
    public string Url { get; set; } = null!;
    public string? PublicId { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // RELACIONES
    public virtual TestimonialCopy TestimonialCopy { get; set; } = null!;
}
