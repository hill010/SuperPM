namespace Storyboard.WebApi.Models;

public sealed class CreditAccount
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public int Balance { get; set; }
    public int TotalEarned { get; set; }
    public int TotalUsed { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public User User { get; set; } = default!;
    public List<CreditTransaction> Transactions { get; set; } = new();
}
