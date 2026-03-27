namespace CmsPro.Domain.Entities;
using CmsPro.Domain.Enums;

public class Testimonial
{
    public Guid Id { get; private set; }

    public string Content { get; private set; } = string.Empty;

    public string? ImageUrl { get; private set; }

    public string? VideoUrl { get; private set; }

    public TestimonialStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? ApprovedAt { get; private set; }
    public DateTime? DummyField { get; private set; }

    // Constructor principal
    public Testimonial(string content, string? imageUrl, string? videoUrl)
    {
        Id = Guid.NewGuid();
        Content = content;
        ImageUrl = imageUrl;
        VideoUrl = videoUrl;
        Status = TestimonialStatus.Pending;
        CreatedAt = DateTime.UtcNow;
        DummyField = DateTime.UtcNow;
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