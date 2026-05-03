using Storyboard.WebApi.Data;
using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Services;

public interface IWorkspaceService
{
    Task<Workspace> CreateWorkspaceForUserAsync(User user, int initialCredits = 2000);
}

public sealed class WorkspaceService : IWorkspaceService
{
    private readonly WebDbContext _db;

    public WorkspaceService(WebDbContext db)
    {
        _db = db;
    }

    public async Task<Workspace> CreateWorkspaceForUserAsync(User user, int initialCredits = 2000)
    {
        // Create workspace
        var workspace = new Workspace
        {
            Id = Guid.NewGuid(),
            Name = $"{user.DisplayName} 的工作区",
            OwnerId = user.Id,
            CreatedAt = DateTimeOffset.UtcNow
        };
        _db.Workspaces.Add(workspace);

        // Add user as workspace member
        var member = new WorkspaceMember
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspace.Id,
            UserId = user.Id,
            Role = "owner",
            JoinedAt = DateTimeOffset.UtcNow
        };
        _db.WorkspaceMembers.Add(member);

        // Create credit account with initial credits
        var creditAccount = new CreditAccount
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Balance = initialCredits,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        _db.CreditAccounts.Add(creditAccount);

        // Record initial credit transaction
        var transaction = new CreditTransaction
        {
            Id = Guid.NewGuid(),
            AccountId = creditAccount.Id,
            Amount = initialCredits,
            Type = "initial_grant",
            Description = "新用户注册赠送积分",
            CreatedAt = DateTimeOffset.UtcNow
        };
        _db.CreditTransactions.Add(transaction);

        // Create free subscription
        var subscription = new Subscription
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            Plan = "free",
            Status = "active",
            CreditsPerMonth = initialCredits,
            StartedAt = DateTimeOffset.UtcNow,
            CurrentPeriodStart = DateTimeOffset.UtcNow,
            CurrentPeriodEnd = DateTimeOffset.UtcNow.AddMonths(1)
        };
        _db.Subscriptions.Add(subscription);

        await _db.SaveChangesAsync();

        return workspace;
    }
}