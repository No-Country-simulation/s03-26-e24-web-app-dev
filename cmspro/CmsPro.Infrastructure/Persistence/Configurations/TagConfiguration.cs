using CmsPro.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CmsPro.Infrastructure.Persistence.Configurations;

public class TagConfiguration : IEntityTypeConfiguration<Tag>
{
    public void Configure(EntityTypeBuilder<Tag> builder)
    {
        builder.ToTable("Tag");
        
        builder.HasIndex(t => t.Slug).IsUnique();
        builder.Property(t => t.Name).IsRequired().HasMaxLength(50);
    }
}
