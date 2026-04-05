using CmsPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CmsPro.Infrastructure.Persistence.Configurations;

public class TestimonialCopyMediaAssetConfiguration : IEntityTypeConfiguration<TestimonialCopyMediaAsset>
{
    public void Configure(EntityTypeBuilder<TestimonialCopyMediaAsset> builder)
    {
        builder.ToTable("Testimonial_copy_media_asset");
        
        builder.Property(m => m.SortOrder).HasDefaultValue(0);
        
        builder.HasOne(m => m.TestimonialCopy)
            .WithMany(tc => tc.MediaAssets)
            .HasForeignKey(m => m.TestimonialCopyId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
