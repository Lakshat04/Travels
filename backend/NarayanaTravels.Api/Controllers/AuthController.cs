using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NarayanaTravels.Core.Dtos;
using NarayanaTravels.Infrastructure.Data;
using NarayanaTravels.Infrastructure.Services;

namespace NarayanaTravels.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwtService;

    public AuthController(AppDbContext db, JwtService jwtService)
    {
        _db = db;
        _jwtService = jwtService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDto>> Login(LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.UsernameOrEmail) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Username and password are required." });

        var user = await _db.AdminUsers.FirstOrDefaultAsync(u =>
            u.Username == request.UsernameOrEmail || u.Email == request.UsernameOrEmail);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid username or password." });

        var (token, expiresAt) = _jwtService.GenerateToken(user);

        return Ok(new LoginResponseDto
        {
            Token = token,
            Username = user.Username,
            FullName = user.FullName,
            ExpiresAt = expiresAt
        });
    }
}
