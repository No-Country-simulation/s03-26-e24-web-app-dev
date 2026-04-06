using Microsoft.AspNetCore.Identity;

namespace CmsPro.Domain.Entities
{
    public class User : IdentityUser
    {
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
