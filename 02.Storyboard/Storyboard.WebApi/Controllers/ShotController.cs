using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Storyboard.WebApi.Services;

namespace Storyboard.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ShotController : ControllerBase
{
    private readonly IShotService _shotService;
    private readonly IProjectService _projectService;

    public ShotController(IShotService shotService, IProjectService projectService)
    {
        _shotService = shotService;
        _projectService = projectService;
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> GetProjectShots(Guid projectId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var shots = await _shotService.GetProjectShotsAsync(projectId, userId);

        return Ok(shots.Select(s => new
        {
            id = s.Id,
            shotNumber = s.ShotNumber,
            duration = s.Duration,
            shotType = s.ShotType,
            coreContent = s.CoreContent,
            actionCommand = s.ActionCommand,
            sceneSettings = s.SceneSettings,
            firstFramePrompt = s.FirstFramePrompt,
            lastFramePrompt = s.LastFramePrompt,
            videoPrompt = s.VideoPrompt,
            firstFrameImagePath = s.FirstFrameImagePath,
            lastFrameImagePath = s.LastFrameImagePath,
            createdAt = s.CreatedAt,
            updatedAt = s.UpdatedAt
        }));
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetShot(long id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var shot = await _shotService.GetShotAsync(id, userId);
        if (shot == null)
            return NotFound();

        return Ok(new
        {
            id = shot.Id,
            projectId = shot.ProjectId,
            shotNumber = shot.ShotNumber,
            duration = shot.Duration,
            shotType = shot.ShotType,
            coreContent = shot.CoreContent,
            actionCommand = shot.ActionCommand,
            sceneSettings = shot.SceneSettings,
            firstFramePrompt = shot.FirstFramePrompt,
            lastFramePrompt = shot.LastFramePrompt,
            videoPrompt = shot.VideoPrompt,
            firstFrameImagePath = shot.FirstFrameImagePath,
            lastFrameImagePath = shot.LastFrameImagePath,
            createdAt = shot.CreatedAt,
            updatedAt = shot.UpdatedAt
        });
    }

    [HttpPost("project/{projectId}")]
    public async Task<IActionResult> CreateShot(Guid projectId, [FromBody] CreateShotRequest? request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        try
        {
            var shot = await _shotService.CreateShotAsync(projectId, userId, request ?? new CreateShotRequest());

            return Ok(new
            {
                id = shot.Id,
                projectId = shot.ProjectId,
                shotNumber = shot.ShotNumber,
                duration = shot.Duration,
                shotType = shot.ShotType,
                coreContent = shot.CoreContent,
                actionCommand = shot.ActionCommand,
                sceneSettings = shot.SceneSettings,
                firstFramePrompt = shot.FirstFramePrompt,
                lastFramePrompt = shot.LastFramePrompt,
                videoPrompt = shot.VideoPrompt,
                createdAt = shot.CreatedAt,
                updatedAt = shot.UpdatedAt
            });
        }
        catch (InvalidOperationException ex)
        {
            return Forbid(ex.Message);
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateShot(long id, [FromBody] UpdateShotRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var shot = await _shotService.UpdateShotAsync(id, userId, request);
        if (shot == null)
            return NotFound();

        return Ok(new
        {
            id = shot.Id,
            shotNumber = shot.ShotNumber,
            duration = shot.Duration,
            shotType = shot.ShotType,
            coreContent = shot.CoreContent,
            actionCommand = shot.ActionCommand,
            sceneSettings = shot.SceneSettings,
            firstFramePrompt = shot.FirstFramePrompt,
            lastFramePrompt = shot.LastFramePrompt,
            videoPrompt = shot.VideoPrompt,
            firstFrameImagePath = shot.FirstFrameImagePath,
            lastFrameImagePath = shot.LastFrameImagePath,
            updatedAt = shot.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteShot(long id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var deleted = await _shotService.DeleteShotAsync(id, userId);
        if (!deleted)
            return NotFound();

        return Ok(new { message = "镜头已删除" });
    }

    [HttpPost("project/{projectId}/reorder")]
    public async Task<IActionResult> ReorderShots(Guid projectId, [FromBody] ReorderShotsRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var shots = await _shotService.ReorderShotsAsync(projectId, userId, request.OrderedIds);

        return Ok(shots.Select(s => new
        {
            id = s.Id,
            shotNumber = s.ShotNumber,
            updatedAt = s.UpdatedAt
        }));
    }

    [HttpPost("{id}/duplicate")]
    public async Task<IActionResult> DuplicateShot(long id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var shot = await _shotService.DuplicateShotAsync(id, userId);
        if (shot == null)
            return NotFound();

        return Ok(new
        {
            id = shot.Id,
            projectId = shot.ProjectId,
            shotNumber = shot.ShotNumber,
            duration = shot.Duration,
            shotType = shot.ShotType,
            coreContent = shot.CoreContent,
            actionCommand = shot.ActionCommand,
            sceneSettings = shot.SceneSettings,
            firstFramePrompt = shot.FirstFramePrompt,
            lastFramePrompt = shot.LastFramePrompt,
            videoPrompt = shot.VideoPrompt,
            createdAt = shot.CreatedAt,
            updatedAt = shot.UpdatedAt
        });
    }
}

public sealed class ReorderShotsRequest
{
    public List<long> OrderedIds { get; set; } = new();
}