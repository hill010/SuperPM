namespace Storyboard.WebApi.Models;

public sealed class ShotAsset
{
    public long Id { get; set; }
    public long ShotId { get; set; }
    public Guid ProjectId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
    public string? ThumbnailPath { get; set; }
    public string? Prompt { get; set; }
    public string? Model { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Shot Shot { get; set; } = default!;
}
