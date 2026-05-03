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
public sealed class ImageController : ControllerBase
{
    private readonly IImageGenerationService _imageService;
    private readonly ICreditService _creditService;
    private readonly WebDbContext _db;

    public ImageController(
        IImageGenerationService imageService,
        ICreditService creditService,
        WebDbContext db)
    {
        _imageService = imageService;
        _creditService = creditService;
        _db = db;
    }

    [HttpPost("shot/{shotId}/first-frame")]
    public async Task<IActionResult> GenerateFirstFrame(long shotId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var shot = await _db.Shots
            .Include(s => s.Project)
            .ThenInclude(p => p.Workspace)
            .FirstOrDefaultAsync(s => s.Id == shotId);

        if (shot == null)
            return NotFound(new { error = "镜头不存在" });

        // Verify user has access to the project
        var member = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == shot.Project.WorkspaceId && m.UserId == userId);
        if (member == null)
            return Forbid();

        // Check credits
        var hasCredits = await _creditService.HasEnoughCreditsAsync(userId, _imageService.CreditsPerImage);
        if (!hasCredits)
            return BadRequest(new { error = "积分不足" });

        // Reserve credits
        await _creditService.ReserveCreditsAsync(userId, _imageService.CreditsPerImage);

        try
        {
            var prompt = shot.FirstFramePrompt;
            if (string.IsNullOrWhiteSpace(prompt))
                prompt = shot.CoreContent;

            var result = await _imageService.GenerateImageAsync(prompt, shot.NegativePrompt, shot.Project.AspectRatio);

            if (!result.Success)
            {
                await _creditService.ReturnReservedCreditsAsync(userId, _imageService.CreditsPerImage);
                return BadRequest(new { error = result.Error ?? "生成失败" });
            }

            // Deduct credits
            await _creditService.DeductReservedCreditsAsync(userId, result.CreditsUsed, "首帧图片生成");

            // Update shot
            shot.FirstFrameImagePath = result.ImageUrl;
            shot.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                shotId = shot.Id,
                type = "first-frame",
                imageUrl = result.ImageUrl,
                creditsUsed = result.CreditsUsed
            });
        }
        catch (Exception)
        {
            await _creditService.ReturnReservedCreditsAsync(userId, _imageService.CreditsPerImage);
            throw;
        }
    }

    [HttpPost("shot/{shotId}/last-frame")]
    public async Task<IActionResult> GenerateLastFrame(long shotId)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var shot = await _db.Shots
            .Include(s => s.Project)
            .ThenInclude(p => p.Workspace)
            .FirstOrDefaultAsync(s => s.Id == shotId);

        if (shot == null)
            return NotFound(new { error = "镜头不存在" });

        var member = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == shot.Project.WorkspaceId && m.UserId == userId);
        if (member == null)
            return Forbid();

        var hasCredits = await _creditService.HasEnoughCreditsAsync(userId, _imageService.CreditsPerImage);
        if (!hasCredits)
            return BadRequest(new { error = "积分不足" });

        await _creditService.ReserveCreditsAsync(userId, _imageService.CreditsPerImage);

        try
        {
            var prompt = shot.LastFramePrompt;
            if (string.IsNullOrWhiteSpace(prompt))
                prompt = shot.CoreContent;

            var result = await _imageService.GenerateImageAsync(prompt, shot.NegativePrompt, shot.Project.AspectRatio);

            if (!result.Success)
            {
                await _creditService.ReturnReservedCreditsAsync(userId, _imageService.CreditsPerImage);
                return BadRequest(new { error = result.Error ?? "生成失败" });
            }

            await _creditService.DeductReservedCreditsAsync(userId, result.CreditsUsed, "尾帧图片生成");

            shot.LastFrameImagePath = result.ImageUrl;
            shot.UpdatedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                shotId = shot.Id,
                type = "last-frame",
                imageUrl = result.ImageUrl,
                creditsUsed = result.CreditsUsed
            });
        }
        catch (Exception)
        {
            await _creditService.ReturnReservedCreditsAsync(userId, _imageService.CreditsPerImage);
            throw;
        }
    }

    [HttpPost("batch")]
    public async Task<IActionResult> BatchGenerate([FromBody] BatchGenerateRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        if (request.ShotIds.Count == 0)
            return BadRequest(new { error = "请选择至少一个镜头" });

        // Validate shots belong to user's workspace
        var shots = await _db.Shots
            .Include(s => s.Project)
            .ThenInclude(p => p.Workspace)
            .Where(s => request.ShotIds.Contains(s.Id))
            .ToListAsync();

        if (shots.Count != request.ShotIds.Count)
            return NotFound(new { error = "部分镜头不存在" });

        var workspaceIds = shots.Select(s => s.Project.WorkspaceId).Distinct().ToList();
        if (workspaceIds.Count > 1)
            return BadRequest(new { error = "不能跨工作区批量生成" });

        var member = await _db.WorkspaceMembers
            .FirstOrDefaultAsync(m => m.WorkspaceId == workspaceIds[0] && m.UserId == userId);
        if (member == null)
            return Forbid();

        // Calculate total credits needed
        var imagesPerShot = request.GenerateType switch
        {
            "first" => 1,
            "last" => 1,
            "both" => 2,
            _ => 1
        };
        var totalCredits = shots.Count * imagesPerShot * _imageService.CreditsPerImage;

        var hasCredits = await _creditService.HasEnoughCreditsAsync(userId, totalCredits);
        if (!hasCredits)
            return BadRequest(new { error = $"积分不足，需要 {totalCredits} 积分" });

        // Process each shot
        var results = new List<object>();
        foreach (var shot in shots)
        {
            await _creditService.ReserveCreditsAsync(userId, imagesPerShot * _imageService.CreditsPerImage);

            try
            {
                if (request.GenerateType is "first" or "both")
                {
                    var prompt = shot.FirstFramePrompt ?? shot.CoreContent;
                    var result = await _imageService.GenerateImageAsync(prompt, shot.NegativePrompt, shot.Project.AspectRatio);
                    if (result.Success)
                    {
                        shot.FirstFrameImagePath = result.ImageUrl;
                        await _creditService.DeductReservedCreditsAsync(userId, result.CreditsUsed, "首帧图片生成");
                        results.Add(new { shotId = shot.Id, type = "first-frame", imageUrl = result.ImageUrl, success = true });
                    }
                    else
                    {
                        await _creditService.ReturnReservedCreditsAsync(userId, _imageService.CreditsPerImage);
                        results.Add(new { shotId = shot.Id, type = "first-frame", success = false, error = result.Error });
                    }
                }

                if (request.GenerateType is "last" or "both")
                {
                    var prompt = shot.LastFramePrompt ?? shot.CoreContent;
                    var result = await _imageService.GenerateImageAsync(prompt, shot.NegativePrompt, shot.Project.AspectRatio);
                    if (result.Success)
                    {
                        shot.LastFrameImagePath = result.ImageUrl;
                        await _creditService.DeductReservedCreditsAsync(userId, result.CreditsUsed, "尾帧图片生成");
                        results.Add(new { shotId = shot.Id, type = "last-frame", imageUrl = result.ImageUrl, success = true });
                    }
                    else
                    {
                        await _creditService.ReturnReservedCreditsAsync(userId, _imageService.CreditsPerImage);
                        results.Add(new { shotId = shot.Id, type = "last-frame", success = false, error = result.Error });
                    }
                }
            }
            catch (Exception ex)
            {
                await _creditService.ReturnReservedCreditsAsync(userId, imagesPerShot * _imageService.CreditsPerImage);
                results.Add(new { shotId = shot.Id, success = false, error = ex.Message });
            }

            shot.UpdatedAt = DateTimeOffset.UtcNow;
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            totalShots = shots.Count,
            creditsUsed = results.Where(r => ((dynamic)r).success).Sum(r => ((dynamic)r).type == "both" ? 40 : 20),
            results
        });
    }
}

public sealed class BatchGenerateRequest
{
    public List<long> ShotIds { get; init; } = new();
    /// <summary>
    /// "first", "last", or "both"
    /// </summary>
    public string GenerateType { get; init; } = "first";
}