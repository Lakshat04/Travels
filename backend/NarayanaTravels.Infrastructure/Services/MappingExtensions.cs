using NarayanaTravels.Core.Dtos;
using NarayanaTravels.Core.Entities;

namespace NarayanaTravels.Infrastructure.Services;

public static class MappingExtensions
{
    public static BillDto ToDto(this Bill b) => new()
    {
        Id = b.Id,
        InvoiceNumber = b.InvoiceNumber,
        InvoiceDate = b.InvoiceDate,
        CustomerId = b.CustomerId,
        CustomerName = b.Customer?.Name ?? string.Empty,
        MobileNumber = b.Customer?.MobileNumber ?? string.Empty,
        Email = b.Customer?.Email,
        Address = b.Customer?.Address,
        TravelDate = b.TravelDate,
        From = b.From,
        To = b.To,
        BoardingPoint = b.BoardingPoint,
        DroppingPoint = b.DroppingPoint,
        VehicleNumber = b.VehicleNumber,
        PassengerCount = b.PassengerCount,
        Passengers = b.Passengers.Select(p => new PassengerDto { Id = p.Id, Name = p.Name, SeatNumber = p.SeatNumber }).ToList(),
        Items = b.Items.Select(i => new BillItemDto
        {
            Id = i.Id,
            Description = i.Description,
            Quantity = i.Quantity,
            Rate = i.Rate,
            Discount = i.Discount,
            Tax = i.Tax,
            Amount = i.Amount
        }).ToList(),
        Subtotal = b.Subtotal,
        Discount = b.Discount,
        Tax = b.Tax,
        OtherCharges = b.OtherCharges,
        GrandTotal = b.GrandTotal,
        AmountPaid = b.AmountPaid,
        BalanceAmount = b.BalanceAmount,
        PaymentStatus = b.PaymentStatus,
        PaymentMethod = b.PaymentMethod,
        TransactionReference = b.TransactionReference,
        PaymentDate = b.PaymentDate,
        CreatedAt = b.CreatedAt,
        UpdatedAt = b.UpdatedAt
    };

    public static BillListItemDto ToListItemDto(this Bill b) => new()
    {
        Id = b.Id,
        InvoiceNumber = b.InvoiceNumber,
        CustomerName = b.Customer?.Name ?? string.Empty,
        TravelDate = b.TravelDate,
        From = b.From,
        To = b.To,
        GrandTotal = b.GrandTotal,
        AmountPaid = b.AmountPaid,
        BalanceAmount = b.BalanceAmount,
        PaymentStatus = b.PaymentStatus
    };

    public static CustomerDto ToDto(this Customer c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        MobileNumber = c.MobileNumber,
        Email = c.Email,
        Address = c.Address,
        TotalBills = c.Bills?.Count ?? 0,
        TotalSpent = c.Bills?.Sum(b => b.GrandTotal) ?? 0,
        CreatedAt = c.CreatedAt
    };
}
