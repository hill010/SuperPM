using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Storyboard.WebApi.Data;

namespace Storyboard.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class UserController : ControllerBase
{
    private readonly WebDbContext _db;

    public UserController(WebDbContext db)
    {
        _db = db;
    }

    [HttpGet("test")]
    public IActionResult TestAuth()
    {
        var claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList();
        return Ok(new {
            message = "UserController auth works",
            userId = User.FindFirst(System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Sub)?.Value,
            nameIdentifier = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
            email = User.FindFirst(ClaimTypes.Email)?.Value,
            allClaims = claims
        });
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        var creditAccount = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        var subscription = await _db.Subscriptions.FirstOrDefaultAsync(s => s.UserId == userId);

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            displayName = user.DisplayName,
            avatarUrl = user.AvatarUrl,
            credits = creditAccount?.Balance ?? 0,
            subscription = subscription == null ? null : new
            {
                plan = subscription.Plan,
                status = subscription.Status,
                monthlyCredits = subscription.MonthlyCredits,
                currentPeriodEnd = subscription.CurrentPeriodEnd
            }
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _db.Users.FindAsync(userId);
        if (user == null)
            return NotFound();

        if (!string.IsNullOrWhiteSpace(request.DisplayName))
            user.DisplayName = request.DisplayName;

        if (!string.IsNullOrWhiteSpace(request.AvatarUrl))
            user.AvatarUrl = request.AvatarUrl;

        user.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            displayName = user.DisplayName,
            avatarUrl = user.AvatarUrl
        });
    }

    [HttpGet("me/credits")]
    public async Task<IActionResult> GetCreditBalance()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (account == null)
            return Ok(new { balance = 0 });

        return Ok(new { balance = account.Balance });
    }

    [HttpGet("me/transactions")]
    public async Task<IActionResult> GetCreditTransactions([FromQuery] int limit = 20)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (account == null)
            return Ok(Array.Empty<object>());

        var transactions = await _db.CreditTransactions
            .Where(t => t.AccountId == account.Id)
            .OrderByDescending(t => t.CreatedAt.UtcTicks)
            .Take(limit)
            .Select(t => new
            {
                id = t.Id,
                amount = t.Amount,
                type = t.Type,
                description = t.Description,
                createdAt = t.CreatedAt
            })
            .ToListAsync();

        return Ok(transactions);
    }
}

public sealed class UpdateProfileRequest
{
    public string? DisplayName { get; set; }
    public string? AvatarUrl { get; set; }
}