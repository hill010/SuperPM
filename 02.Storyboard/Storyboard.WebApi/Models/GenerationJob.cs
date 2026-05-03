namespace Storyboard.WebApi.Models;

public sealed class GenerationJob
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid ProjectId { get; set; }
    public long? ShotId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Status { get; set; } = "queued";
    public string? Input { get; set; }
    public string? Output { get; set; }
    public string? Error { get; set; }
    public int CreditsUsed { get; set; }
    public int RetryCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? StartedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
}
