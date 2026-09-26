using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NarayanaTravels.Core.Dtos;
using NarayanaTravels.Core.Entities;
using NarayanaTravels.Infrastructure.Data;
using NarayanaTravels.Infrastructure.Services;

namespace NarayanaTravels.Api.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ControllerBase
{
    private readonly AppDbContext _db;

    public CustomersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CustomerDto>>> GetCustomers([FromQuery] string? search)
    {
        var query = _db.Customers.Include(c => c.Bills).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(c => c.Name.Contains(search) || c.MobileNumber.Contains(search) || (c.Email != null && c.Email.Contains(search)));

        var customers = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return Ok(customers.Select(c => c.ToDto()));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CustomerDto>> GetCustomer(int id)
    {
        var customer = await _db.Customers.Include(c => c.Bills).FirstOrDefaultAsync(c => c.Id == id);
        if (customer == null) return NotFound(new { message = "Customer not found." });
        return Ok(customer.ToDto());
    }

    [HttpPost]
    public async Task<ActionResult<CustomerDto>> CreateCustomer(CustomerCreateDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Customer name is required." });
        if (string.IsNullOrWhiteSpace(dto.MobileNumber))
            return BadRequest(new { message = "Mobile number is required." });

        var customer = new Customer
        {
            Name = dto.Name,
            MobileNumber = dto.MobileNumber,
            Email = dto.Email,
            Address = dto.Address
        };

        _db.Customers.Add(customer);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer.ToDto());
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CustomerDto>> UpdateCustomer(int id, CustomerCreateDto dto)
    {
        var customer = await _db.Customers.FindAsync(id);
        if (customer == null) return NotFound(new { message = "Customer not found." });

        if (string.IsNullOrWhiteSpace(dto.Name))
            return BadRequest(new { message = "Customer name is required." });

        customer.Name = dto.Name;
        customer.MobileNumber = dto.MobileNumber;
        customer.Email = dto.Email;
        customer.Address = dto.Address;
        customer.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(customer.ToDto());
    }
}
