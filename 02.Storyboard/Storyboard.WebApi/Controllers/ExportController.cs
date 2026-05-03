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
public sealed class ExportController : ControllerBase
{
    private readonly IExportService _exportService;
    private readonly WebDbContext _db;

    public ExportController(IExportService exportService, WebDbContext db)
    {
        _exportService = exportService;
        _db = db;
    }

    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> ExportProject(Guid projectId, [FromQuery] string format = "markdown")
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            return Unauthorized();

        var project = await _db.Projects
            .Include(p => p.Shots)
            .Include(p => p.Workspace)
            .ThenInclude(w => w.Members)
            .FirstOrDefaultAsync(p => p.Id == projectId);

        if (project == null)
            return NotFound(new { error = "项目不存在" });

        // Verify user has access
        var member = project.Workspace.Members.FirstOrDefault(m => m.UserId == userId);
        if (member == null)
            return Forbid();

        var shots = project.Shots.OrderBy(s => s.ShotNumber).ToList();

        try
        {
            var fileName = $"{project.Name}_分镜表_{DateTimeOffset.UtcNow:yyyyMMdd}";
            var contentType = format.ToLowerInvariant() switch
            {
                "csv" => "text/csv",
                "pdf" => "application/pdf",
                _ => "text/markdown"
            };
            var extension = format.ToLowerInvariant() switch
            {
                "csv" => ".csv",
                "pdf" => ".pdf",
                _ => ".md"
            };

            if (format.ToLowerInvariant() == "csv")
            {
                var content = await _exportService.ExportToCsvAsync(project, shots);
                return File(System.Text.Encoding.UTF8.GetBytes(content), contentType, fileName + extension);
            }
            else if (format.ToLowerInvariant() == "pdf")
            {
                var content = await _exportService.ExportToPdfAsync(project, shots);
                return File(content, contentType, fileName + extension);
            }
            else
            {
                var content = await _exportService.ExportToMarkdownAsync(project, shots);
                return File(System.Text.Encoding.UTF8.GetBytes(content), contentType, fileName + extension);
            }
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = $"导出失败: {ex.Message}" });
        }
    }
}