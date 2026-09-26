using NarayanaTravels.Core.Enums;

namespace NarayanaTravels.Core.Dtos;

public class BillItemDto
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public decimal Rate { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Amount { get; set; }
}

public class PassengerDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? SeatNumber { get; set; }
}

public class BillCreateUpdateDto
{
    // Customer
    public int? CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }

    // Travel
    public DateTime TravelDate { get; set; }
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string? BoardingPoint { get; set; }
    public string? DroppingPoint { get; set; }
    public string? VehicleNumber { get; set; }
    public int PassengerCount { get; set; }
    public List<PassengerDto> Passengers { get; set; } = new();

    // Billing
    public List<BillItemDto> Items { get; set; } = new();
    public decimal OtherCharges { get; set; }

    // Payment
    public PaymentStatus PaymentStatus { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public decimal AmountPaid { get; set; }
    public DateTime? PaymentDate { get; set; }
    public string? TransactionReference { get; set; }
}

public class BillDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }

    public int CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string MobileNumber { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Address { get; set; }

    public DateTime TravelDate { get; set; }
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public string? BoardingPoint { get; set; }
    public string? DroppingPoint { get; set; }
    public string? VehicleNumber { get; set; }
    public int PassengerCount { get; set; }
    public List<PassengerDto> Passengers { get; set; } = new();

    public List<BillItemDto> Items { get; set; } = new();

    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal OtherCharges { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal BalanceAmount { get; set; }

    public PaymentStatus PaymentStatus { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string? TransactionReference { get; set; }
    public DateTime? PaymentDate { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class BillListItemDto
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string CustomerName { get; set; } = string.Empty;
    public DateTime TravelDate { get; set; }
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
    public decimal GrandTotal { get; set; }
    public decimal AmountPaid { get; set; }
    public decimal BalanceAmount { get; set; }
    public PaymentStatus PaymentStatus { get; set; }
}

public class DashboardSummaryDto
{
    public int TotalBills { get; set; }
    public int TodaysBills { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal PaidAmount { get; set; }
    public decimal PendingAmount { get; set; }
    public int TotalCustomers { get; set; }
    public List<BillListItemDto> RecentBills { get; set; } = new();
}
