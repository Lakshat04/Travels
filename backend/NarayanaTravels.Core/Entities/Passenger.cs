namespace NarayanaTravels.Core.Entities;

public class Passenger
{
    public int Id { get; set; }
    public int BillId { get; set; }
    public Bill? Bill { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? SeatNumber { get; set; }
}
