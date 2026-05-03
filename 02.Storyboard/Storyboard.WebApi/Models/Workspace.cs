namespace Storyboard.WebApi.Models;

public sealed class Workspace
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid OwnerId { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public User Owner { get; set; } = default!;
    public List<WorkspaceMember> Members { get; set; } = new();
    public List<Project> Projects { get; set; } = new();
}
