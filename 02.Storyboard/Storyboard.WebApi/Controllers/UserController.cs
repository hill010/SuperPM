using System.IdentityModel.Tokens.Jwt;
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

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var user = await _db.Users
            .Include(u => u.CreditAccount)
            .Include(u => u.Subscription)
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            return NotFound();

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            displayName = user.DisplayName,
            avatarUrl = user.AvatarUrl,
            credits = user.CreditAccount?.Balance ?? 0,
            subscription = user.Subscription == null ? null : new
            {
                plan = user.Subscription.Plan,
                status = user.Subscription.Status,
                creditsPerMonth = user.Subscription.CreditsPerMonth,
                currentPeriodEnd = user.Subscription.CurrentPeriodEnd
            }
        });
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
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
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
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
        var userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (account == null)
            return Ok(Array.Empty<object>());

        var transactions = await _db.CreditTransactions
            .Where(t => t.AccountId == account.Id)
            .OrderByDescending(t => t.CreatedAt)
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