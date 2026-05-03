namespace Storyboard.WebApi.Models;

public sealed class CreditTransaction
{
    public Guid Id { get; set; }
    public Guid AccountId { get; set; }
    public string Type { get; set; } = string.Empty;
    public int Amount { get; set; }
    public int BalanceAfter { get; set; }
    public string? Description { get; set; }
    public Guid? JobId { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public CreditAccount Account { get; set; } = default!;
}
