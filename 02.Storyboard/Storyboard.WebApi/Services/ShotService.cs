using Microsoft.EntityFrameworkCore;
using Storyboard.WebApi.Data;
using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Services;

public interface IShotService
{
    Task<List<Shot>> GetProjectShotsAsync(Guid projectId, Guid userId);
    Task<Shot?> GetShotAsync(long shotId, Guid userId);
    Task<Shot> CreateShotAsync(Guid projectId, Guid userId, CreateShotRequest request);
    Task<Shot?> UpdateShotAsync(long shotId, Guid userId, UpdateShotRequest request);
    Task<bool> DeleteShotAsync(long shotId, Guid userId);
    Task<List<Shot>> ReorderShotsAsync(Guid projectId, Guid userId, List<long> orderedIds);
    Task<Shot?> DuplicateShotAsync(long shotId, Guid userId);
}

public sealed record CreateShotRequest
{
    public double Duration { get; init; } = 3.0;
    public string ShotType { get; init; } = "";
    public string CoreContent { get; init; } = "";
    public string ActionCommand { get; init; } = "";
    public string SceneSettings { get; init; } = "";
    public string FirstFramePrompt { get; init; } = "";
    public string LastFramePrompt { get; init; } = "";
    public string VideoPrompt { get; init; } = "";
}

public sealed record UpdateShotRequest
{
    public double? Duration { get; init; }
    public string? ShotType { get; init; }
    public string? CoreContent { get; init; }
    public string? ActionCommand { get; init; }
    public string? SceneSettings { get; init; }
    public string? FirstFramePrompt { get; init; }
    public string? LastFramePrompt { get; init; }
    public string? VideoPrompt { get; init; }
    public string? FirstFrameImagePath { get; init; }
    public string? LastFrameImagePath { get; init; }
}

public sealed class ShotService : IShotService
{
    private readonly WebDbContext _db;

    public ShotService(WebDbContext db)
    {
        _db = db;
    }

    private async Task<bool> CanAccessProjectAsync(Guid projectId, Guid userId)
    {
        var workspace = await _db.Workspaces.FirstOrDefaultAsync(w => w.OwnerId == userId);
        if (workspace == null) return false;

        return await _db.Projects.AnyAsync(p => p.Id == projectId && p.WorkspaceId == workspace.Id);
    }

    private async Task<bool> CanAccessShotProjectAsync(long shotId, Guid userId)
    {
        var shot = await _db.Shots.FindAsync(shotId);
        if (shot == null) return false;
        return await CanAccessProjectAsync(shot.ProjectId, userId);
    }

    public async Task<List<Shot>> GetProjectShotsAsync(Guid projectId, Guid userId)
    {
        if (!await CanAccessProjectAsync(projectId, userId))
            return new List<Shot>();

        return await _db.Shots
            .Where(s => s.ProjectId == projectId)
            .OrderBy(s => s.ShotNumber)
            .ToListAsync();
    }

    public async Task<Shot?> GetShotAsync(long shotId, Guid userId)
    {
        if (!await CanAccessShotProjectAsync(shotId, userId))
            return null;

        return await _db.Shots.FindAsync(shotId);
    }

    public async Task<Shot> CreateShotAsync(Guid projectId, Guid userId, CreateShotRequest request)
    {
        if (!await CanAccessProjectAsync(projectId, userId))
            throw new InvalidOperationException("无权访问此项目");

        // Get max shot number
        var maxNumber = await _db.Shots
            .Where(s => s.ProjectId == projectId)
            .MaxAsync(s => (int?)s.ShotNumber) ?? 0;

        var shot = new Shot
        {
            Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(), // Use timestamp as ID
            ProjectId = projectId,
            ShotNumber = maxNumber + 1,
            Duration = request.Duration,
            ShotType = request.ShotType,
            CoreContent = request.CoreContent,
            ActionCommand = request.ActionCommand,
            SceneSettings = request.SceneSettings,
            FirstFramePrompt = request.FirstFramePrompt,
            LastFramePrompt = request.LastFramePrompt,
            VideoPrompt = request.VideoPrompt,
            SelectedModel = "",
            ImageSize = "",
            NegativePrompt = "",
            AspectRatio = "",
            Composition = "",
            LightingType = "",
            TimeOfDay = "",
            ColorStyle = "",
            LensType = "",
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Shots.Add(shot);
        await _db.SaveChangesAsync();

        return shot;
    }

    public async Task<Shot?> UpdateShotAsync(long shotId, Guid userId, UpdateShotRequest request)
    {
        var shot = await GetShotAsync(shotId, userId);
        if (shot == null) return null;

        if (request.Duration.HasValue)
            shot.Duration = request.Duration.Value;
        if (request.ShotType != null)
            shot.ShotType = request.ShotType;
        if (request.CoreContent != null)
            shot.CoreContent = request.CoreContent;
        if (request.ActionCommand != null)
            shot.ActionCommand = request.ActionCommand;
        if (request.SceneSettings != null)
            shot.SceneSettings = request.SceneSettings;
        if (request.FirstFramePrompt != null)
            shot.FirstFramePrompt = request.FirstFramePrompt;
        if (request.LastFramePrompt != null)
            shot.LastFramePrompt = request.LastFramePrompt;
        if (request.VideoPrompt != null)
            shot.VideoPrompt = request.VideoPrompt;
        if (request.FirstFrameImagePath != null)
            shot.FirstFrameImagePath = request.FirstFrameImagePath;
        if (request.LastFrameImagePath != null)
            shot.LastFrameImagePath = request.LastFrameImagePath;

        shot.UpdatedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        return shot;
    }

    public async Task<bool> DeleteShotAsync(long shotId, Guid userId)
    {
        var shot = await GetShotAsync(shotId, userId);
        if (shot == null) return false;

        var projectId = shot.ProjectId;
        var shotNumber = shot.ShotNumber;

        _db.Shots.Remove(shot);
        await _db.SaveChangesAsync();

        // Reorder remaining shots
        var remainingShots = await _db.Shots
            .Where(s => s.ProjectId == projectId && s.ShotNumber > shotNumber)
            .ToListAsync();

        foreach (var s in remainingShots)
        {
            s.ShotNumber--;
            s.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await _db.SaveChangesAsync();

        return true;
    }

    public async Task<List<Shot>> ReorderShotsAsync(Guid projectId, Guid userId, List<long> orderedIds)
    {
        if (!await CanAccessProjectAsync(projectId, userId))
            return new List<Shot>();

        var shots = await _db.Shots
            .Where(s => s.ProjectId == projectId)
            .ToListAsync();

        for (int i = 0; i < orderedIds.Count; i++)
        {
            var shot = shots.FirstOrDefault(s => s.Id == orderedIds[i]);
            if (shot != null)
            {
                shot.ShotNumber = i + 1;
                shot.UpdatedAt = DateTimeOffset.UtcNow;
            }
        }

        await _db.SaveChangesAsync();

        return shots.OrderBy(s => s.ShotNumber).ToList();
    }

    public async Task<Shot?> DuplicateShotAsync(long shotId, Guid userId)
    {
        var shot = await GetShotAsync(shotId, userId);
        if (shot == null) return null;

        var newShot = new Shot
        {
            Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            ProjectId = shot.ProjectId,
            ShotNumber = shot.ShotNumber + 1,
            Duration = shot.Duration,
            ShotType = shot.ShotType,
            CoreContent = shot.CoreContent,
            ActionCommand = shot.ActionCommand,
            SceneSettings = shot.SceneSettings,
            FirstFramePrompt = shot.FirstFramePrompt,
            LastFramePrompt = shot.LastFramePrompt,
            VideoPrompt = shot.VideoPrompt,
            SelectedModel = shot.SelectedModel,
            ImageSize = shot.ImageSize,
            NegativePrompt = shot.NegativePrompt,
            AspectRatio = shot.AspectRatio,
            Composition = shot.Composition,
            LightingType = shot.LightingType,
            TimeOfDay = shot.TimeOfDay,
            ColorStyle = shot.ColorStyle,
            LensType = shot.LensType,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        // Shift shots after the duplicated one
        var shotsAfter = await _db.Shots
            .Where(s => s.ProjectId == shot.ProjectId && s.ShotNumber > shot.ShotNumber)
            .ToListAsync();

        foreach (var s in shotsAfter)
        {
            s.ShotNumber++;
            s.UpdatedAt = DateTimeOffset.UtcNow;
        }

        _db.Shots.Add(newShot);
        await _db.SaveChangesAsync();

        return newShot;
    }
}