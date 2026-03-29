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
            .HasMaxLength(2000);

        builder.Property(t => t.AuthorName)
            .IsRequired()
            .HasMaxLength(150);
        
        builder.Property(t => t.Format)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(t => t.MultimediaUrl)
            .HasMaxLength(500);

        builder.Property(t => t.Status)
            .IsRequired()
            .HasConversion<string>();

        builder.Property(t => t.CreatedAt)
            .IsRequired();

        builder.Property(t => t.ApprovedAt);
<<<<<<< HEAD
=======

        builder.Property(t => t.CategoryId);

        builder.Property(t => t.IsDeleted)
            .IsRequired()
            .HasDefaultValue(false);

        builder.HasOne(t => t.Category)
            .WithMany()
            .HasForeignKey(t => t.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);
>>>>>>> 251aa3597f56ed45bc8b1b8ff740787feaaae13d
    }
}