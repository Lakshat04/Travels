namespace NarayanaTravels.Core.Enums;

public enum PaymentStatus
{
    Pending,
    PartiallyPaid,
    Paid,
    Cancelled
}

public enum PaymentMethod
{
    Cash,
    UPI,
    Card,
    BankTransfer,
    Other
}
