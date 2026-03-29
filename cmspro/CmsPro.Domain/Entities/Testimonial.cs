namespace CmsPro.Domain.Entities;
using CmsPro.Domain.Enums;

public class Testimonial
{
    public Guid Id { get; set; }

    public string Content { get; set; } = string.Empty;

    public string? ImageUrl { get; set; }

    public string? VideoUrl { get; set; }

    public TestimonialStatus Status { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? ApprovedAt { get; set; }
    public bool IsDeleted { get; set; }

    // Constructor principal
    public Testimonial(string content, string? imageUrl, string? videoUrl)
    {
        Id = Guid.NewGuid();
        Content = content;
        ImageUrl = imageUrl;
        VideoUrl = videoUrl;
        Status = TestimonialStatus.Pending;
        CreatedAt = DateTime.UtcNow;
        IsDeleted = false;
    }

    // Métodos de dominio (IMPORTANTE 🔥)

    public void Approve()
    {
        if (Status != TestimonialStatus.Pending)
            throw new InvalidOperationException("Only pending testimonials can be approved.");

        Status = TestimonialStatus.Approved;
        ApprovedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        if (Status != TestimonialStatus.Pending)
            throw new InvalidOperationException("Only pending testimonials can be rejected.");

        Status = TestimonialStatus.Rejected;
    }
}