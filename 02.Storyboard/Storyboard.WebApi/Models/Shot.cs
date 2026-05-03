namespace Storyboard.WebApi.Models;

public sealed class Shot
{
    public long Id { get; set; }
    public Guid ProjectId { get; set; }
    public int ShotNumber { get; set; }
    public double Duration { get; set; }
    public string ShotType { get; set; } = string.Empty;
    public string CoreContent { get; set; } = string.Empty;
    public string ActionCommand { get; set; } = string.Empty;
    public string SceneSettings { get; set; } = string.Empty;
    public string FirstFramePrompt { get; set; } = string.Empty;
    public string LastFramePrompt { get; set; } = string.Empty;
    public string VideoPrompt { get; set; } = string.Empty;
    public string? FirstFrameImagePath { get; set; }
    public string? LastFrameImagePath { get; set; }
    public string SelectedModel { get; set; } = string.Empty;
    public string ImageSize { get; set; } = string.Empty;
    public string NegativePrompt { get; set; } = string.Empty;
    public string AspectRatio { get; set; } = string.Empty;
    public string Composition { get; set; } = string.Empty;
    public string LightingType { get; set; } = string.Empty;
    public string TimeOfDay { get; set; } = string.Empty;
    public string ColorStyle { get; set; } = string.Empty;
    public string LensType { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Project Project { get; set; } = default!;
    public List<ShotAsset> Assets { get; set; } = new();
}
