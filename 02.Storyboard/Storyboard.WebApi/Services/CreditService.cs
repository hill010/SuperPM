using Microsoft.EntityFrameworkCore;
using Storyboard.WebApi.Data;
using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Services;

public interface ICreditService
{
    Task<bool> HasEnoughCreditsAsync(Guid userId, int amount);
    Task<bool> ReserveCreditsAsync(Guid userId, int amount);
    Task<bool> DeductReservedCreditsAsync(Guid userId, int amount, string description);
    Task<bool> ReturnReservedCreditsAsync(Guid userId, int amount);
    Task<bool> DeductCreditsAsync(Guid userId, int amount, string description);
    Task<int> GetBalanceAsync(Guid userId);
}

public sealed class CreditService : ICreditService
{
    private readonly WebDbContext _db;

    public CreditService(WebDbContext db)
    {
        _db = db;
    }

    public async Task<bool> HasEnoughCreditsAsync(Guid userId, int amount)
    {
        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        return account != null && account.Balance >= amount;
    }

    public async Task<bool> ReserveCreditsAsync(Guid userId, int amount)
    {
        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (account == null || account.Balance < amount)
            return false;

        // For simplicity, we just check balance without separate reservation
        // In a real system, you'd have a separate "reserved" balance field
        return true;
    }

    public async Task<bool> DeductReservedCreditsAsync(Guid userId, int amount, string description)
    {
        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (account == null)
            return false;

        if (account.Balance < amount)
            return false;

        account.Balance -= amount;
        account.TotalUsed += amount;
        account.UpdatedAt = DateTimeOffset.UtcNow;

        // Create transaction record
        var transaction = new CreditTransaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Amount = -amount,
            Type = "usage",
            Description = description,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.CreditTransactions.Add(transaction);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ReturnReservedCreditsAsync(Guid userId, int amount)
    {
        // In this simplified implementation, we just add credits back
        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (account == null)
            return false;

        account.Balance += amount;
        account.TotalUsed -= amount;
        account.UpdatedAt = DateTimeOffset.UtcNow;

        // Create refund transaction
        var transaction = new CreditTransaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Amount = amount,
            Type = "refund",
            Description = "任务失败，积分退回",
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.CreditTransactions.Add(transaction);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<bool> DeductCreditsAsync(Guid userId, int amount, string description)
    {
        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        if (account == null || account.Balance < amount)
            return false;

        account.Balance -= amount;
        account.TotalUsed += amount;
        account.UpdatedAt = DateTimeOffset.UtcNow;

        var transaction = new CreditTransaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Amount = -amount,
            Type = "usage",
            Description = description,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.CreditTransactions.Add(transaction);
        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<int> GetBalanceAsync(Guid userId)
    {
        var account = await _db.CreditAccounts.FirstOrDefaultAsync(c => c.UserId == userId);
        return account?.Balance ?? 0;
    }
}