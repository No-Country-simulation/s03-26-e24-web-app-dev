namespace CmsPro.Domain.Entities;

public class TestimonialCopy
{
    public Guid Id { get; set; }
    public Guid TestimonialId { get; set; }
    public string? Type { get; set; }
    public string? Title { get; set; }
    public string? Body { get; set; }
    public string? ExtendedBody { get; set; }
    public string? AuthorName { get; set; }
    public string? AuthorRole { get; set; }
    public string? AuthorOrganization { get; set; }
    public Guid? CategoryId { get; set; }
    public Category? Category { get; private set; }
    public string? Status { get; set; }
    public Guid CreatedById { get; set; }
    public Guid? ReviewedById { get; set; }
    public DateTimeOffset? ReviewedAt { get; set; }
    public string? ReviewComment { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
    
    // RELACIONES
    public Testimonial Testimonial { get; set; } = null!;
    
    // N:M Automática con Tag
    public ICollection<Tag> Tags { get; set; } = new List<Tag>();

    // 1:N con la intermedia manual de MediaAssets
    public ICollection<TestimonialCopyMediaAsset> MediaAssets { get; set; } = new List<TestimonialCopyMediaAsset>();
}
