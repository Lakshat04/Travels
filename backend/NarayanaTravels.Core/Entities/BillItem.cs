namespace NarayanaTravels.Core.Entities;

public class BillItem
{
    public int Id { get; set; }
    public int BillId { get; set; }
    public Bill? Bill { get; set; }

    public string Description { get; set; } = string.Empty;
    public decimal Quantity { get; set; } = 1;
    public decimal Rate { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal Amount { get; set; }
}
