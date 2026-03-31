namespace CmsPro.Domain.Entities;

using CmsPro.Domain.Enums;

public class Testimonial
{
    public Guid Id { get; private set; }

    public string AuthorName { get; set; }

    public string Content { get; set; }

    public string? MultimediaUrl { get; set; }

    public TestimonialStatus Status { get; set; }

    public MultimediaType Format { get; set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? ApprovedAt { get; private set; }

    public bool IsDeleted { get; set; }

    // Relación con Categoría
    public Guid CategoryId { get; set; }

    public Category? Category { get; private set; }

    // Constructor principal
    public Testimonial(string authorName, string content, Guid categoryId, MultimediaType format, string? multimediaUrl)
    {

        if (string.IsNullOrWhiteSpace(authorName)) throw new ArgumentException("El campo Author es requerido.");
        if (string.IsNullOrWhiteSpace(authorName)) throw new ArgumentException("El campo Content es requerido.");

        Id = Guid.NewGuid();
        AuthorName = authorName;
        Content = content;
        CategoryId = categoryId;
        Format = format;
        MultimediaUrl = multimediaUrl;

        Status = TestimonialStatus.Draft;
        CreatedAt = DateTime.UtcNow;
    }

    // Métodos de dominio
    public void Publish()
    {
        if (Status != TestimonialStatus.Pending)
            throw new InvalidOperationException("Only pending testimonials can be published.");

        Status = TestimonialStatus.Published;
        ApprovedAt = DateTime.UtcNow;
    }

    public void Reject()
    {
        if (Status != TestimonialStatus.Pending)
            throw new InvalidOperationException("Only pending testimonials can be rejected.");

        Status = TestimonialStatus.Rejected;
    }
}