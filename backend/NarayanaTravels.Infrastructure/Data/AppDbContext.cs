using Microsoft.EntityFrameworkCore;
using NarayanaTravels.Core.Entities;

namespace NarayanaTravels.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Bill> Bills => Set<Bill>();
    public DbSet<BillItem> BillItems => Set<BillItem>();
    public DbSet<Passenger> Passengers => Set<Passenger>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Bill>(b =>
        {
            b.HasIndex(x => x.InvoiceNumber).IsUnique();
            b.Property(x => x.Subtotal).HasColumnType("decimal(18,2)");
            b.Property(x => x.Discount).HasColumnType("decimal(18,2)");
            b.Property(x => x.Tax).HasColumnType("decimal(18,2)");
            b.Property(x => x.OtherCharges).HasColumnType("decimal(18,2)");
            b.Property(x => x.GrandTotal).HasColumnType("decimal(18,2)");
            b.Property(x => x.AmountPaid).HasColumnType("decimal(18,2)");
            b.Property(x => x.BalanceAmount).HasColumnType("decimal(18,2)");

            b.HasOne(x => x.Customer)
                .WithMany(c => c.Bills)
                .HasForeignKey(x => x.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            b.HasMany(x => x.Items)
                .WithOne(i => i.Bill!)
                .HasForeignKey(i => i.BillId)
                .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(x => x.Passengers)
                .WithOne(p => p.Bill!)
                .HasForeignKey(p => p.BillId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BillItem>(i =>
        {
            i.Property(x => x.Quantity).HasColumnType("decimal(18,2)");
            i.Property(x => x.Rate).HasColumnType("decimal(18,2)");
            i.Property(x => x.Discount).HasColumnType("decimal(18,2)");
            i.Property(x => x.Tax).HasColumnType("decimal(18,2)");
            i.Property(x => x.Amount).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<Customer>(c =>
        {
            c.HasIndex(x => x.MobileNumber);
        });

        modelBuilder.Entity<AdminUser>(a =>
        {
            a.HasIndex(x => x.Username).IsUnique();
            a.HasIndex(x => x.Email).IsUnique();
        });
    }
}
