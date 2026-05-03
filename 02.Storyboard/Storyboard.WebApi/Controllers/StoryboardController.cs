using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Storyboard.WebApi.Hubs;
using Storyboard.WebApi.Services;

namespace Storyboard.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public sealed class StoryboardController : ControllerBase
{
    private readonly IStoryboardAIService _storyboardService;
    private readonly ICreditService _creditService;
    private readonly IHubContext<GenerationHub> _hubContext;

    public StoryboardController(
        IStoryboardAIService storyboardService,
        ICreditService creditService,
        IHubContext<GenerationHub> hubContext)
    {
        _storyboardService = storyboardService;
        _creditService = creditService;
        _hubContext = hubContext;
    }

    [HttpPost("project/{projectId}/generate")]
    public async Task<IActionResult> GenerateStoryboard(
        Guid projectId,
        [FromBody] GenerateStoryboardRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        if (string.IsNullOrWhiteSpace(request.Script))
            return BadRequest(new { error = "脚本内容不能为空" });

        if (request.ShotCount < 1 || request.ShotCount > 50)
            return BadRequest(new { error = "镜头数量需在 1-50 之间" });

        // Check credits (10 credits per shot)
        var totalCredits = request.ShotCount * 10;
        var hasCredits = await _creditService.HasEnoughCreditsAsync(userId, totalCredits);
        if (!hasCredits)
            return BadRequest(new { error = $"积分不足，需要 {totalCredits} 积分" });

        try
        {
            // Create job
            var job = await _storyboardService.CreateStoryboardJobAsync(
                projectId, userId, request.Script, request.ShotCount);

            // Process job synchronously for MVP
            try
            {
                var shots = await _storyboardService.ProcessStoryboardJobAsync(job);

                return Ok(new
                {
                    jobId = job.Id,
                    status = "succeeded",
                    creditsUsed = job.CreditsUsed,
                    shotCount = shots.Count,
                    shotIds = shots.Select(s => s.Id).ToList()
                });
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    jobId = job.Id,
                    status = "failed",
                    creditsUsed = job.CreditsUsed,
                    error = ex.Message
                });
            }
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("jobs/{jobId}")]
    public async Task<IActionResult> GetJobStatus(Guid jobId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var job = await _storyboardService.GetJobAsync(jobId, userId);
        if (job == null)
            return NotFound();

        return Ok(new
        {
            id = job.Id,
            type = job.Type,
            status = job.Status,
            creditsUsed = job.CreditsUsed,
            error = job.Error,
            createdAt = job.CreatedAt,
            startedAt = job.StartedAt,
            completedAt = job.CompletedAt
        });
    }

    [HttpGet("jobs")]
    public async Task<IActionResult> GetUserJobs()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var jobs = await _storyboardService.GetUserJobsAsync(userId);

        return Ok(jobs.Select(j => new
        {
            id = j.Id,
            type = j.Type,
            status = j.Status,
            creditsUsed = j.CreditsUsed,
            error = j.Error,
            createdAt = j.CreatedAt,
            completedAt = j.CompletedAt
        }));
    }
}

public sealed class GenerateStoryboardRequest
{
    public string Script { get; init; } = "";
    public int ShotCount { get; init; } = 10;
}