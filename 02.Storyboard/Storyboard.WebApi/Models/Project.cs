namespace Storyboard.WebApi.Models;

public sealed class Project
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? AspectRatio { get; set; }
    public string? TargetDuration { get; set; }
    public string? CreativeGoal { get; set; }
    public string? TargetAudience { get; set; }
    public string? VideoTone { get; set; }
    public string? KeyMessage { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Workspace Workspace { get; set; } = default!;
    public List<Shot> Shots { get; set; } = new();
}
