using Microsoft.EntityFrameworkCore;
using Storyboard.WebApi.Data;
using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Services;

public interface IProjectService
{
    Task<List<Project>> GetUserProjectsAsync(Guid userId);
    Task<Project?> GetProjectAsync(Guid projectId, Guid userId);
    Task<Project> CreateProjectAsync(Guid userId, CreateProjectRequest request);
    Task<Project?> UpdateProjectAsync(Guid projectId, Guid userId, UpdateProjectRequest request);
    Task<bool> DeleteProjectAsync(Guid projectId, Guid userId);
}

public sealed record CreateProjectRequest(
    string Name,
    string? AspectRatio,
    string? TargetDuration,
    string? CreativeGoal,
    string? TargetAudience,
    string? VideoTone
);

public sealed record UpdateProjectRequest(
    string? Name,
    string? AspectRatio,
    string? TargetDuration,
    string? CreativeGoal,
    string? TargetAudience,
    string? VideoTone
);

public sealed class ProjectService : IProjectService
{
    private readonly WebDbContext _db;

    public ProjectService(WebDbContext db)
    {
        _db = db;
    }

    public async Task<List<Project>> GetUserProjectsAsync(Guid userId)
    {
        // Get user's workspace
        var workspace = await _db.Workspaces
            .FirstOrDefaultAsync(w => w.OwnerId == userId);

        if (workspace == null)
            return new List<Project>();

        // Get projects (SQLite workaround: sort in memory)
        var projects = await _db.Projects
            .Where(p => p.WorkspaceId == workspace.Id)
            .ToListAsync();

        projects = projects.OrderByDescending(p => p.UpdatedAt).ToList();

        return projects;
    }

    public async Task<Project?> GetProjectAsync(Guid projectId, Guid userId)
    {
        var workspace = await _db.Workspaces
            .FirstOrDefaultAsync(w => w.OwnerId == userId);

        if (workspace == null)
            return null;

        var project = await _db.Projects
            .Include(p => p.Shots)
            .FirstOrDefaultAsync(p => p.Id == projectId && p.WorkspaceId == workspace.Id);

        return project;
    }

    public async Task<Project> CreateProjectAsync(Guid userId, CreateProjectRequest request)
    {
        var workspace = await _db.Workspaces
            .FirstOrDefaultAsync(w => w.OwnerId == userId);

        if (workspace == null)
            throw new InvalidOperationException("User workspace not found");

        var project = new Project
        {
            Id = Guid.NewGuid(),
            WorkspaceId = workspace.Id,
            Name = request.Name,
            AspectRatio = request.AspectRatio,
            TargetDuration = request.TargetDuration,
            CreativeGoal = request.CreativeGoal,
            TargetAudience = request.TargetAudience,
            VideoTone = request.VideoTone,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Projects.Add(project);
        await _db.SaveChangesAsync();

        return project;
    }

    public async Task<Project?> UpdateProjectAsync(Guid projectId, Guid userId, UpdateProjectRequest request)
    {
        var project = await GetProjectAsync(projectId, userId);
        if (project == null)
            return null;

        if (request.Name != null)
            project.Name = request.Name;
        if (request.AspectRatio != null)
            project.AspectRatio = request.AspectRatio;
        if (request.TargetDuration != null)
            project.TargetDuration = request.TargetDuration;
        if (request.CreativeGoal != null)
            project.CreativeGoal = request.CreativeGoal;
        if (request.TargetAudience != null)
            project.TargetAudience = request.TargetAudience;
        if (request.VideoTone != null)
            project.VideoTone = request.VideoTone;

        project.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        return project;
    }

    public async Task<bool> DeleteProjectAsync(Guid projectId, Guid userId)
    {
        var project = await GetProjectAsync(projectId, userId);
        if (project == null)
            return false;

        _db.Projects.Remove(project);
        await _db.SaveChangesAsync();

        return true;
    }
}