using System.Text;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Services;

public sealed class ExportService : IExportService
{
    public ExportService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

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

        sb.AppendLine("镜头编号,景别,时长(秒),核心内容,动作,场景,首帧提示词,尾帧提示词,视频提示词,首帧图片,尾帧图片");

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
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Arial));

                page.Header()
                    .AlignCenter()
                    .Text($"分镜表 - {project.Name}")
                    .FontSize(20).Bold();

                page.Content().Element(content =>
                {
                    content.Column(col =>
                    {
                        // Project info
                        col.Item().PaddingBottom(5).Text($"画幅比例: {project.AspectRatio ?? "未设置"}");
                        col.Item().PaddingBottom(5).Text($"镜头数量: {shots.Count}");
                        col.Item().PaddingBottom(15).Text($"导出时间: {DateTimeOffset.UtcNow:yyyy-MM-dd HH:mm:ss}");

                        // Shot cards
                        foreach (var shot in shots.OrderBy(s => s.ShotNumber))
                        {
                            col.Item().PaddingVertical(8).Element(shotContainer =>
                            {
                                shotContainer
                                    .Border(1)
                                    .BorderColor(Colors.Grey.Lighten2)
                                    .Padding(8)
                                    .Column(shotCol =>
                                    {
                                        // Shot header
                                        shotCol.Item().PaddingBottom(5).Row(row =>
                                        {
                                            row.RelativeItem().Text($"镜头 #{shot.ShotNumber}").FontSize(14).Bold();
                                            row.ConstantItem(80).AlignRight().Text($"{shot.Duration}s");
                                        });

                                        // Shot info
                                        shotCol.Item().PaddingBottom(3).Text($"景别: {shot.ShotType}  |  时长: {shot.Duration}s").FontSize(9);
                                        shotCol.Item().PaddingBottom(3).Text($"核心内容: {shot.CoreContent}").FontSize(9);
                                        shotCol.Item().PaddingBottom(3).Text($"动作: {shot.ActionCommand}").FontSize(9);
                                        shotCol.Item().PaddingBottom(5).Text($"场景: {shot.SceneSettings}").FontSize(9);

                                        // Images row
                                        shotCol.Item().PaddingTop(5).Row(imageRow =>
                                        {
                                            // First frame
                                            imageRow.RelativeItem().Element(firstFrameContainer =>
                                            {
                                                firstFrameContainer
                                                    .Border(1)
                                                    .BorderColor(Colors.Grey.Lighten2)
                                                    .Padding(5)
                                                    .Column(firstCol =>
                                                    {
                                                        firstCol.Item().Text("首帧").FontSize(8).Bold();
                                                        AddImageIfExists(firstCol, shot.FirstFrameImagePath);
                                                    });
                                            });

                                            imageRow.ConstantItem(10);

                                            // Last frame
                                            imageRow.RelativeItem().Element(lastFrameContainer =>
                                            {
                                                lastFrameContainer
                                                    .Border(1)
                                                    .BorderColor(Colors.Grey.Lighten2)
                                                    .Padding(5)
                                                    .Column(lastCol =>
                                                    {
                                                        lastCol.Item().Text("尾帧").FontSize(8).Bold();
                                                        AddImageIfExists(lastCol, shot.LastFrameImagePath);
                                                    });
                                            });
                                        });

                                        // Prompts
                                        shotCol.Item().PaddingTop(5).Text($"首帧提示词: {shot.FirstFramePrompt}").FontSize(8).FontColor(Colors.Grey.Darken1);
                                        shotCol.Item().Text($"尾帧提示词: {shot.LastFramePrompt}").FontSize(8).FontColor(Colors.Grey.Darken1);
                                    });
                            });
                        }
                    });
                });

                page.Footer()
                    .AlignCenter()
                    .Text(x =>
                    {
                        x.Span("第 ");
                        x.CurrentPageNumber();
                        x.Span(" 页");
                    });
            });
        });

        var pdfBytes = document.GeneratePdf();
        return Task.FromResult(pdfBytes);
    }

    private static void AddImageIfExists(ColumnDescriptor col, string? imagePath)
    {
        if (!string.IsNullOrEmpty(imagePath))
        {
            try
            {
                if (File.Exists(imagePath))
                {
                    var imageBytes = File.ReadAllBytes(imagePath);
                    col.Item().PaddingTop(3).Image(imageBytes).FitWidth();
                }
                else
                {
                    col.Item().PaddingTop(3).Text("[图片不存在]").FontSize(8).FontColor(Colors.Grey.Medium);
                }
            }
            catch
            {
                col.Item().PaddingTop(3).Text("[图片加载失败]").FontSize(8).FontColor(Colors.Grey.Medium);
            }
        }
        else
        {
            col.Item().PaddingTop(3).Height(50).Background(Colors.Grey.Lighten3);
        }
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
