using CmsPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CmsPro.Infrastructure.Persistence.Configurations;

public class MediaAssetConfiguration : IEntityTypeConfiguration<MediaAsset>
{
    public void Configure(EntityTypeBuilder<MediaAsset> builder)
    {
        builder.ToTable("Media_asset");
            
        builder.Property(m => m.Url).IsRequired();
        builder.Property(m => m.SortOrder).HasDefaultValue(0);

        builder.HasOne(m => m.Testimonial)
            .WithMany(t => t.MediaAssets)
            .HasForeignKey(m => m.TestimonialId);
    }
}
