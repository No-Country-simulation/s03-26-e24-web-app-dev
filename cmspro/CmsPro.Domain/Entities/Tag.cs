namespace CmsPro.Domain.Entities;

public class Tag
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string Slug { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // RELACIONES
    public virtual ICollection<Testimonial> Testimonials { get; set; } = new List<Testimonial>();
    public virtual ICollection<TestimonialCopy> TestimonialCopies { get; set; } = new List<TestimonialCopy>();
}
