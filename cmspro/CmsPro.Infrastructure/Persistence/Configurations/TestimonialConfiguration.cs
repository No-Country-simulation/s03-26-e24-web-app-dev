using CmsPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CmsPro.Infrastructure.Persistence.Configurations;

public class TestimonialConfiguration : IEntityTypeConfiguration<Testimonial>
{
    public void Configure(EntityTypeBuilder<Testimonial> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Content)
            .IsRequired()
            .HasMaxLength(1000);

        builder.Property(t => t.ImageUrl)
            .HasMaxLength(500);

        builder.Property(t => t.VideoUrl)
            .HasMaxLength(500);

        builder.Property(t => t.Status)
            .IsRequired();

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.ApprovedAt);
    }
}