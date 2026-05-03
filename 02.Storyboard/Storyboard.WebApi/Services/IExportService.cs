using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Services;

public interface IExportService
{
    /// <summary>
    /// Export project shots to Markdown format.
    /// </summary>
    Task<string> ExportToMarkdownAsync(Project project, List<Shot> shots);

    /// <summary>
    /// Export project shots to CSV format.
    /// </summary>
    Task<string> ExportToCsvAsync(Project project, List<Shot> shots);

    /// <summary>
    /// Export project shots to PDF format (with images).
    /// </summary>
    Task<byte[]> ExportToPdfAsync(Project project, List<Shot> shots);
}