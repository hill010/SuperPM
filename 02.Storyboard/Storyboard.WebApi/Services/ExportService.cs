using System.Text;
using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Services;

public sealed class ExportService : IExportService
{
    public Task<string> ExportToMarkdownAsync(Project project, List<Shot> shots)
    {
        var sb = new StringBuilder();

        sb.AppendLine($"# {project.Name}");
        sb.AppendLine();
        sb.AppendLine($"**画幅比例**: {project.AspectRatio ?? "未设置"}");
        sb.AppendLine($"**镜头数量**: {shots.Count}");
        sb.AppendLine($"**导出时间**: {DateTimeOffset.UtcNow:yyyy-MM-dd HH:mm:ss}");
        sb.AppendLine();

        foreach (var shot in shots.OrderBy(s => s.ShotNumber))
        {
            sb.AppendLine($"## 镜头 #{shot.ShotNumber}");
            sb.AppendLine();
            sb.AppendLine($"| 属性 | 内容 |");
            sb.AppendLine($"|------|------|");
            sb.AppendLine($"| 景别 | {shot.ShotType} |");
            sb.AppendLine($"| 时长 | {shot.Duration}s |");
            sb.AppendLine($"| 核心内容 | {shot.CoreContent} |");
            sb.AppendLine($"| 动作 | {shot.ActionCommand} |");
            sb.AppendLine($"| 场景 | {shot.SceneSettings} |");
            sb.AppendLine($"| 首帧提示词 | {shot.FirstFramePrompt} |");
            sb.AppendLine($"| 尾帧提示词 | {shot.LastFramePrompt} |");
            sb.AppendLine($"| 视频提示词 | {shot.VideoPrompt} |");
            if (shot.FirstFrameImagePath != null)
                sb.AppendLine($"| 首帧图片 | {shot.FirstFrameImagePath} |");
            if (shot.LastFrameImagePath != null)
                sb.AppendLine($"| 尾帧图片 | {shot.LastFrameImagePath} |");
            sb.AppendLine();
        }

        return Task.FromResult(sb.ToString());
    }

    public Task<string> ExportToCsvAsync(Project project, List<Shot> shots)
    {
        var sb = new StringBuilder();

        // Header
        sb.AppendLine("镜头编号,景别,时长(秒),核心内容,动作,场景,首帧提示词,尾帧提示词,视频提示词,首帧图片,尾帧图片");

        // Rows
        foreach (var shot in shots.OrderBy(s => s.ShotNumber))
        {
            var coreContent = EscapeCsv(shot.CoreContent);
            var action = EscapeCsv(shot.ActionCommand);
            var scene = EscapeCsv(shot.SceneSettings);
            var firstFramePrompt = EscapeCsv(shot.FirstFramePrompt);
            var lastFramePrompt = EscapeCsv(shot.LastFramePrompt);
            var videoPrompt = EscapeCsv(shot.VideoPrompt);
            var firstFrameImage = EscapeCsv(shot.FirstFrameImagePath ?? "");
            var lastFrameImage = EscapeCsv(shot.LastFrameImagePath ?? "");

            sb.AppendLine($"{shot.ShotNumber},{shot.ShotType},{shot.Duration},{coreContent},{action},{scene},{firstFramePrompt},{lastFramePrompt},{videoPrompt},{firstFrameImage},{lastFrameImage}");
        }

        return Task.FromResult(sb.ToString());
    }

    public Task<byte[]> ExportToPdfAsync(Project project, List<Shot> shots)
    {
        // PDF export would require a PDF library like PdfSharp or similar
        // For MVP, we'll return a simple text-based "PDF" (actually markdown converted to bytes)
        var markdown = ExportToMarkdownAsync(project, shots).Result;
        return Task.FromResult(Encoding.UTF8.GetBytes(markdown));
    }

    private static string EscapeCsv(string value)
    {
        if (value.Contains(',') || value.Contains('"') || value.Contains('\n'))
        {
            return $"\"{value.Replace("\"", "\"\"")}\"";
        }
        return value;
    }
}