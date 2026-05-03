using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Storyboard.WebApi.Data;
using Storyboard.WebApi.Models;
using Storyboard.WebApi.Services;

namespace Storyboard.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class AuthController : ControllerBase
{
    private readonly WebDbContext _db;
    private readonly IAuthService _authService;
    private readonly IWorkspaceService _workspaceService;

    public AuthController(WebDbContext db, IAuthService authService, IWorkspaceService workspaceService)
    {
        _db = db;
        _authService = authService;
        _workspaceService = workspaceService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password) || string.IsNullOrWhiteSpace(request.DisplayName))
            return BadRequest(new { error = "邮箱、密码和显示名称不能为空" });

        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return Conflict(new { error = "该邮箱已注册" });

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = _authService.HashPassword(request.Password),
            DisplayName = request.DisplayName,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        // Create workspace and initial credits
        await _workspaceService.CreateWorkspaceForUserAsync(user, 2000);

        var token = _authService.GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserInfo
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Credits = 2000
            }
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { error = "邮箱和密码不能为空" });

        var user = await _db.Users.Include(u => u.CreditAccount).FirstOrDefaultAsync(u => u.Email == request.Email);
        if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { error = "邮箱或密码错误" });

        if (!user.IsActive)
            return Forbid();

        var token = _authService.GenerateJwtToken(user);

        return Ok(new AuthResponse
        {
            Token = token,
            User = new UserInfo
            {
                Id = user.Id,
                Email = user.Email,
                DisplayName = user.DisplayName,
                Credits = user.CreditAccount?.Balance ?? 0
            }
        });
    }

    [HttpPost("refresh")]
    public IActionResult Refresh()
    {
        var userId = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value;
        if (userId == null)
            return Unauthorized();

        // In a real app, you'd fetch fresh user data and generate a new token
        // For now, just return success (the middleware already validated the token)
        return Ok(new { message = "Token is valid" });
    }
}

public sealed class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
}

public sealed class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public sealed class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public UserInfo User { get; set; } = new();
}

public sealed class UserInfo
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public int Credits { get; set; }
}