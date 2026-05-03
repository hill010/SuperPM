namespace Storyboard.WebApi.Models;

public sealed class WorkspaceMember
{
    public Guid Id { get; set; }
    public Guid WorkspaceId { get; set; }
    public Guid UserId { get; set; }
    public string Role { get; set; } = "member";
    public DateTimeOffset JoinedAt { get; set; } = DateTimeOffset.UtcNow;

    public Workspace Workspace { get; set; } = default!;
    public User User { get; set; } = default!;
}
