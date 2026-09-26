using Microsoft.EntityFrameworkCore;
using NarayanaTravels.Core.Entities;

namespace NarayanaTravels.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (!await db.AdminUsers.AnyAsync())
        {
            db.AdminUsers.Add(new AdminUser
            {
                Username = "admin",
                Email = "admin@narayanatravels.com",
                FullName = "Administrator",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123")
            });
            await db.SaveChangesAsync();
        }
    }
}
