using CmsPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CmsPro.Infrastructure.Persistence.Configurations;

public class TestimonialCopyConfiguration : IEntityTypeConfiguration<TestimonialCopy>
{
    public void Configure(EntityTypeBuilder<TestimonialCopy> builder)
    {
        builder.ToTable("Testimonial_copy");
        
        builder.HasKey(tc => tc.Id);

        builder.Property(tc => tc.Status).IsRequired().HasDefaultValue("pending");

        // Relaciones
        builder.HasOne(tc => tc.Testimonial)
            .WithOne(t => t.TestimonialCopy)
            .HasForeignKey<TestimonialCopy>(tc => tc.TestimonialId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.HasMany(tc => tc.Tags)
            .WithMany(tag => tag.TestimonialCopies)
            .UsingEntity(j => j.ToTable("Testimonial_copy_tag"));
            
        builder.HasOne(tc => tc.Category)
            .WithMany()
            .HasForeignKey(tc => tc.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
        
    }
}
