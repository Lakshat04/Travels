using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NarayanaTravels.Core.Dtos;
using NarayanaTravels.Core.Enums;
using NarayanaTravels.Infrastructure.Data;
using NarayanaTravels.Infrastructure.Services;

namespace NarayanaTravels.Api.Controllers;

[ApiController]
[Route("api/bills")]
[Authorize]
public class BillsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly BillService _billService;
    private readonly InvoicePdfService _pdfService;

    public BillsController(AppDbContext db, BillService billService, InvoicePdfService pdfService)
    {
        _db = db;
        _billService = billService;
        _pdfService = pdfService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BillListItemDto>>> GetBills(
        [FromQuery] string? search,
        [FromQuery] string? invoiceNumber,
        [FromQuery] PaymentStatus? paymentStatus,
        [FromQuery] DateTime? fromDate,
        [FromQuery] DateTime? toDate)
    {
        var query = _db.Bills.Include(b => b.Customer).AsQueryable();

        if (!string.IsNullOrWhiteSpace(invoiceNumber))
            query = query.Where(b => b.InvoiceNumber.Contains(invoiceNumber));

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(b => b.Customer!.Name.Contains(search) || b.InvoiceNumber.Contains(search) || b.Customer!.MobileNumber.Contains(search));

        if (paymentStatus.HasValue)
            query = query.Where(b => b.PaymentStatus == paymentStatus.Value);

        if (fromDate.HasValue)
            query = query.Where(b => b.TravelDate >= fromDate.Value.Date);

        if (toDate.HasValue)
            query = query.Where(b => b.TravelDate <= toDate.Value.Date);

        var bills = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        return Ok(bills.Select(b => b.ToListItemDto()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BillDto>> GetBill(int id)
    {
        var bill = await _db.Bills
            .Include(b => b.Customer)
            .Include(b => b.Items)
            .Include(b => b.Passengers)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bill == null) return NotFound(new { message = "Invoice not found." });
        return Ok(bill.ToDto());
    }

    [HttpPost]
    public async Task<ActionResult<BillDto>> CreateBill(BillCreateUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CustomerName))
            return BadRequest(new { message = "Customer name is required." });
        if (string.IsNullOrWhiteSpace(dto.From) || string.IsNullOrWhiteSpace(dto.To))
            return BadRequest(new { message = "From and To are required." });
        if (dto.Items.Count == 0)
            return BadRequest(new { message = "At least one billing item is required." });
        if (dto.Items.Any(i => i.Quantity <= 0))
            return BadRequest(new { message = "Quantity must be greater than zero." });
        if (dto.Items.Any(i => i.Rate < 0))
            return BadRequest(new { message = "Rate cannot be negative." });

        try
        {
            var bill = await _billService.CreateBillAsync(dto);
            var saved = await _db.Bills
                .Include(b => b.Customer).Include(b => b.Items).Include(b => b.Passengers)
                .FirstAsync(b => b.Id == bill.Id);
            return CreatedAtAction(nameof(GetBill), new { id = saved.Id }, saved.ToDto());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<BillDto>> UpdateBill(int id, BillCreateUpdateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.CustomerName))
            return BadRequest(new { message = "Customer name is required." });
        if (string.IsNullOrWhiteSpace(dto.From) || string.IsNullOrWhiteSpace(dto.To))
            return BadRequest(new { message = "From and To are required." });
        if (dto.Items.Count == 0)
            return BadRequest(new { message = "At least one billing item is required." });
        if (dto.Items.Any(i => i.Quantity <= 0))
            return BadRequest(new { message = "Quantity must be greater than zero." });
        if (dto.Items.Any(i => i.Rate < 0))
            return BadRequest(new { message = "Rate cannot be negative." });

        try
        {
            var bill = await _billService.UpdateBillAsync(id, dto);
            if (bill == null) return NotFound(new { message = "Invoice not found." });
            return Ok(bill.ToDto());
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBill(int id)
    {
        var bill = await _db.Bills.FindAsync(id);
        if (bill == null) return NotFound(new { message = "Invoice not found." });

        _db.Bills.Remove(bill);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet("{id}/pdf")]
    public async Task<IActionResult> DownloadPdf(int id)
    {
        var bill = await _db.Bills
            .Include(b => b.Customer)
            .Include(b => b.Items)
            .Include(b => b.Passengers)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (bill == null) return NotFound(new { message = "Invoice not found." });

        var pdfBytes = _pdfService.GenerateInvoicePdf(bill.ToDto());
        return File(pdfBytes, "application/pdf", $"{bill.InvoiceNumber}.pdf");
    }

    [HttpGet("dashboard/summary")]
    public async Task<ActionResult<DashboardSummaryDto>> GetDashboardSummary()
    {
        var today = DateTime.UtcNow.Date;

        var bills = await _db.Bills.Include(b => b.Customer).ToListAsync();
        var totalCustomers = await _db.Customers.CountAsync();

        var summary = new DashboardSummaryDto
        {
            TotalBills = bills.Count,
            TodaysBills = bills.Count(b => b.CreatedAt.Date == today),
            TotalRevenue = bills.Sum(b => b.GrandTotal),
            PaidAmount = bills.Sum(b => b.AmountPaid),
            PendingAmount = bills.Sum(b => b.BalanceAmount),
            TotalCustomers = totalCustomers,
            RecentBills = bills.OrderByDescending(b => b.CreatedAt).Take(8).Select(b => b.ToListItemDto()).ToList()
        };

        return Ok(summary);
    }

    [HttpGet("dashboard/revenue-trend")]
    public async Task<ActionResult<IEnumerable<RevenuePointDto>>> GetRevenueTrend([FromQuery] int days = 30)
    {
        days = Math.Clamp(days, 1, 365);
        var startDate = DateTime.UtcNow.Date.AddDays(-(days - 1));

        var bills = await _db.Bills
            .Where(b => b.CreatedAt.Date >= startDate)
            .Select(b => new { b.CreatedAt, b.GrandTotal })
            .ToListAsync();

        var byDay = bills
            .GroupBy(b => b.CreatedAt.Date)
            .ToDictionary(g => g.Key, g => g.Sum(b => b.GrandTotal));

        var points = new List<RevenuePointDto>();
        for (var d = startDate; d <= DateTime.UtcNow.Date; d = d.AddDays(1))
        {
            points.Add(new RevenuePointDto { Date = d, Revenue = byDay.TryGetValue(d, out var sum) ? sum : 0 });
        }

        return Ok(points);
    }
}
