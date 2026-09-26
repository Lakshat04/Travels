using Microsoft.EntityFrameworkCore;
using NarayanaTravels.Core.Dtos;
using NarayanaTravels.Core.Entities;
using NarayanaTravels.Core.Enums;
using NarayanaTravels.Infrastructure.Data;

namespace NarayanaTravels.Infrastructure.Services;

public class BillService
{
    private readonly AppDbContext _db;

    public BillService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<string> GenerateInvoiceNumberAsync(int year)
    {
        var prefix = $"NT-{year}-";
        var lastInvoice = await _db.Bills
            .Where(b => b.InvoiceNumber.StartsWith(prefix))
            .OrderByDescending(b => b.Id)
            .Select(b => b.InvoiceNumber)
            .FirstOrDefaultAsync();

        int nextSeq = 1;
        if (lastInvoice != null)
        {
            var parts = lastInvoice.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out var seq))
            {
                nextSeq = seq + 1;
            }
        }

        return $"{prefix}{nextSeq:D4}";
    }

    private static (decimal subtotal, decimal discount, decimal tax, List<BillItem> items) CalculateItems(List<BillItemDto> itemDtos)
    {
        var items = new List<BillItem>();
        decimal subtotal = 0, discount = 0, tax = 0;

        foreach (var i in itemDtos)
        {
            var lineBase = i.Quantity * i.Rate;
            var lineAfterDiscount = lineBase - i.Discount;
            var lineTaxAmount = lineAfterDiscount * (i.Tax / 100m);
            var amount = lineAfterDiscount + lineTaxAmount;

            subtotal += lineBase;
            discount += i.Discount;
            tax += lineTaxAmount;

            items.Add(new BillItem
            {
                Description = i.Description,
                Quantity = i.Quantity,
                Rate = i.Rate,
                Discount = i.Discount,
                Tax = i.Tax,
                Amount = Math.Round(amount, 2)
            });
        }

        return (Math.Round(subtotal, 2), Math.Round(discount, 2), Math.Round(tax, 2), items);
    }

    private static PaymentStatus ResolvePaymentStatus(PaymentStatus requested, decimal grandTotal, decimal amountPaid)
    {
        if (requested == PaymentStatus.Cancelled) return PaymentStatus.Cancelled;
        if (amountPaid <= 0) return PaymentStatus.Pending;
        if (amountPaid >= grandTotal) return PaymentStatus.Paid;
        return PaymentStatus.PartiallyPaid;
    }

    public async Task<Bill> CreateBillAsync(BillCreateUpdateDto dto)
    {
        if (dto.Items.Count == 0)
            throw new ArgumentException("At least one billing item is required.");

        Customer? customer = null;
        if (dto.CustomerId.HasValue)
        {
            customer = await _db.Customers.FindAsync(dto.CustomerId.Value);
        }
        if (customer == null)
        {
            customer = new Customer
            {
                Name = dto.CustomerName,
                MobileNumber = dto.MobileNumber,
                Email = dto.Email,
                Address = dto.Address
            };
            _db.Customers.Add(customer);
        }
        else
        {
            customer.Name = dto.CustomerName;
            customer.MobileNumber = dto.MobileNumber;
            customer.Email = dto.Email;
            customer.Address = dto.Address;
            customer.UpdatedAt = DateTime.UtcNow;
        }

        var (subtotal, discount, tax, items) = CalculateItems(dto.Items);
        var grandTotal = Math.Round(subtotal - discount + tax + dto.OtherCharges, 2);

        if (dto.AmountPaid > grandTotal)
            throw new ArgumentException("Amount paid cannot exceed the grand total.");

        var balance = Math.Round(grandTotal - dto.AmountPaid, 2);
        var paymentStatus = ResolvePaymentStatus(dto.PaymentStatus, grandTotal, dto.AmountPaid);

        var invoiceNumber = await GenerateInvoiceNumberAsync(DateTime.UtcNow.Year);

        var bill = new Bill
        {
            InvoiceNumber = invoiceNumber,
            InvoiceDate = DateTime.UtcNow,
            Customer = customer,
            TravelDate = dto.TravelDate,
            From = dto.From,
            To = dto.To,
            BoardingPoint = dto.BoardingPoint,
            DroppingPoint = dto.DroppingPoint,
            VehicleNumber = dto.VehicleNumber,
            PassengerCount = dto.PassengerCount,
            Subtotal = subtotal,
            Discount = discount,
            Tax = tax,
            OtherCharges = dto.OtherCharges,
            GrandTotal = grandTotal,
            AmountPaid = dto.AmountPaid,
            BalanceAmount = balance,
            PaymentStatus = paymentStatus,
            PaymentMethod = dto.PaymentMethod,
            TransactionReference = dto.TransactionReference,
            PaymentDate = dto.PaymentDate,
            Items = items,
            Passengers = dto.Passengers.Select(p => new Passenger { Name = p.Name, SeatNumber = p.SeatNumber }).ToList()
        };

        // Retry once on unique constraint race for invoice number
        for (var attempt = 0; attempt < 3; attempt++)
        {
            try
            {
                _db.Bills.Add(bill);
                await _db.SaveChangesAsync();
                return bill;
            }
            catch (DbUpdateException) when (attempt < 2)
            {
                _db.Entry(bill).State = EntityState.Detached;
                bill.InvoiceNumber = await GenerateInvoiceNumberAsync(DateTime.UtcNow.Year);
            }
        }

        throw new InvalidOperationException("Unable to generate a unique invoice number.");
    }

    public async Task<Bill?> UpdateBillAsync(int id, BillCreateUpdateDto dto)
    {
        var bill = await _db.Bills
            .Include(b => b.Items)
            .Include(b => b.Passengers)
            .Include(b => b.Customer)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bill == null) return null;
        if (dto.Items.Count == 0)
            throw new ArgumentException("At least one billing item is required.");

        if (bill.Customer != null)
        {
            bill.Customer.Name = dto.CustomerName;
            bill.Customer.MobileNumber = dto.MobileNumber;
            bill.Customer.Email = dto.Email;
            bill.Customer.Address = dto.Address;
            bill.Customer.UpdatedAt = DateTime.UtcNow;
        }

        var (subtotal, discount, tax, items) = CalculateItems(dto.Items);
        var grandTotal = Math.Round(subtotal - discount + tax + dto.OtherCharges, 2);

        if (dto.AmountPaid > grandTotal)
            throw new ArgumentException("Amount paid cannot exceed the grand total.");

        var balance = Math.Round(grandTotal - dto.AmountPaid, 2);
        var paymentStatus = ResolvePaymentStatus(dto.PaymentStatus, grandTotal, dto.AmountPaid);

        bill.TravelDate = dto.TravelDate;
        bill.From = dto.From;
        bill.To = dto.To;
        bill.BoardingPoint = dto.BoardingPoint;
        bill.DroppingPoint = dto.DroppingPoint;
        bill.VehicleNumber = dto.VehicleNumber;
        bill.PassengerCount = dto.PassengerCount;

        bill.Subtotal = subtotal;
        bill.Discount = discount;
        bill.Tax = tax;
        bill.OtherCharges = dto.OtherCharges;
        bill.GrandTotal = grandTotal;
        bill.AmountPaid = dto.AmountPaid;
        bill.BalanceAmount = balance;
        bill.PaymentStatus = paymentStatus;
        bill.PaymentMethod = dto.PaymentMethod;
        bill.TransactionReference = dto.TransactionReference;
        bill.PaymentDate = dto.PaymentDate;
        bill.UpdatedAt = DateTime.UtcNow;

        _db.BillItems.RemoveRange(bill.Items);
        bill.Items = items.Select(i => { i.BillId = bill.Id; return i; }).ToList();

        _db.Passengers.RemoveRange(bill.Passengers);
        bill.Passengers = dto.Passengers.Select(p => new Passenger { BillId = bill.Id, Name = p.Name, SeatNumber = p.SeatNumber }).ToList();

        await _db.SaveChangesAsync();
        return bill;
    }
}
