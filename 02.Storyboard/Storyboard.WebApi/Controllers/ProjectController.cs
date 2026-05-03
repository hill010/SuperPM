using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Storyboard.WebApi.Data;
using Storyboard.WebApi.Services;

namespace Storyboard.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class ProjectController : ControllerBase
{
    private readonly IProjectService _projectService;
    private readonly WebDbContext _db;

    public ProjectController(IProjectService projectService, WebDbContext db)
    {
        _projectService = projectService;
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> ListProjects()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var projects = await _projectService.GetUserProjectsAsync(userId);

        // Get shot counts for each project
        var projectIds = projects.Select(p => p.Id).ToList();
        var shotCounts = await _db.Shots
            .Where(s => projectIds.Contains(s.ProjectId))
            .GroupBy(s => s.ProjectId)
            .Select(g => new { ProjectId = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.ProjectId, x => x.Count);

        var result = projects.Select(p => new
        {
            id = p.Id,
            name = p.Name,
            aspectRatio = p.AspectRatio,
            targetDuration = p.TargetDuration,
            creativeGoal = p.CreativeGoal,
            targetAudience = p.TargetAudience,
            videoTone = p.VideoTone,
            shotCount = shotCounts.GetValueOrDefault(p.Id, 0),
            imageCount = 0, // TODO: Count from ShotAssets
            createdAt = p.CreatedAt,
            updatedAt = p.UpdatedAt
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProject(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var project = await _projectService.GetProjectAsync(id, userId);
        if (project == null)
            return NotFound();

        var shotCount = project.Shots.Count;

        return Ok(new
        {
            id = project.Id,
            name = project.Name,
            aspectRatio = project.AspectRatio,
            targetDuration = project.TargetDuration,
            creativeGoal = project.CreativeGoal,
            targetAudience = project.TargetAudience,
            videoTone = project.VideoTone,
            shotCount,
            imageCount = 0,
            createdAt = project.CreatedAt,
            updatedAt = project.UpdatedAt,
            shots = project.Shots.Select(s => new
            {
                id = s.Id,
                shotNumber = s.ShotNumber,
                duration = s.Duration,
                shotType = s.ShotType,
                coreContent = s.CoreContent,
                action = s.ActionCommand,
                scene = s.SceneSettings,
                firstFramePrompt = s.FirstFramePrompt,
                lastFramePrompt = s.LastFramePrompt,
                videoPrompt = s.VideoPrompt
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateProject([FromBody] CreateProjectRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { error = "项目名称不能为空" });

        var project = await _projectService.CreateProjectAsync(userId, request);

        return Ok(new
        {
            id = project.Id,
            name = project.Name,
            aspectRatio = project.AspectRatio,
            targetDuration = project.TargetDuration,
            creativeGoal = project.CreativeGoal,
            targetAudience = project.TargetAudience,
            videoTone = project.VideoTone,
            shotCount = 0,
            imageCount = 0,
            createdAt = project.CreatedAt,
            updatedAt = project.UpdatedAt
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProject(Guid id, [FromBody] UpdateProjectRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var project = await _projectService.UpdateProjectAsync(id, userId, request);
        if (project == null)
            return NotFound();

        return Ok(new
        {
            id = project.Id,
            name = project.Name,
            aspectRatio = project.AspectRatio,
            targetDuration = project.TargetDuration,
            creativeGoal = project.CreativeGoal,
            targetAudience = project.TargetAudience,
            videoTone = project.VideoTone,
            updatedAt = project.UpdatedAt
        });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProject(Guid id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var deleted = await _projectService.DeleteProjectAsync(id, userId);
        if (!deleted)
            return NotFound();

        return Ok(new { message = "项目已删除" });
    }
}