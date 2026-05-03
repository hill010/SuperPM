using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Storyboard.WebApi.Data;
using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Services;

public interface IStoryboardAIService
{
    Task<GenerationJob> CreateStoryboardJobAsync(Guid projectId, Guid userId, string script, int shotCount);
    Task<List<Shot>> ProcessStoryboardJobAsync(GenerationJob job);
    Task<GenerationJob?> GetJobAsync(Guid jobId, Guid userId);
    Task<List<GenerationJob>> GetUserJobsAsync(Guid userId);
}

public sealed class StoryboardAIService : IStoryboardAIService
{
    private readonly WebDbContext _db;
    private readonly ICreditService _creditService;
    private readonly IShotService _shotService;

    // Credits cost for text-to-storyboard generation
    private const int CREDITS_PER_SHOT = 10;

    public StoryboardAIService(WebDbContext db, ICreditService creditService, IShotService shotService)
    {
        _db = db;
        _creditService = creditService;
        _shotService = shotService;
    }

    public async Task<GenerationJob> CreateStoryboardJobAsync(Guid projectId, Guid userId, string script, int shotCount)
    {
        // Check if user has enough credits
        var totalCredits = shotCount * CREDITS_PER_SHOT;
        var hasCredits = await _creditService.HasEnoughCreditsAsync(userId, totalCredits);
        if (!hasCredits)
            throw new InvalidOperationException("积分不足，请充值后重试");

        // Reserve credits (will be deducted on completion)
        await _creditService.ReserveCreditsAsync(userId, totalCredits);

        var job = new GenerationJob
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            ProjectId = projectId,
            Type = "text-storyboard",
            Status = "queued",
            Input = JsonSerializer.Serialize(new { script, shotCount }),
            CreditsUsed = totalCredits,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.GenerationJobs.Add(job);
        await _db.SaveChangesAsync();

        return job;
    }

    public async Task<List<Shot>> ProcessStoryboardJobAsync(GenerationJob job)
    {
        job.Status = "running";
        job.StartedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();

        try
        {
            // Parse input
            var input = JsonSerializer.Deserialize<StoryboardInput>(job.Input ?? "");
            if (input == null)
                throw new ArgumentException("Invalid job input");

            // Generate shots using mock AI (in real implementation, call AI API)
            var shots = await GenerateShotsFromScriptAsync(job.ProjectId, input.Script, input.ShotCount);

            // Deduct reserved credits
            await _creditService.DeductReservedCreditsAsync(job.UserId, job.CreditsUsed, "AI 拆镜生成");

            // Save shots
            foreach (var shot in shots)
            {
                _db.Shots.Add(shot);
            }
            await _db.SaveChangesAsync();

            // Update job status
            job.Status = "succeeded";
            job.Output = JsonSerializer.Serialize(shots.Select(s => s.Id).ToList());
            job.CompletedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync();

            return shots;
        }
        catch (Exception ex)
        {
            // Return reserved credits on failure
            await _creditService.ReturnReservedCreditsAsync(job.UserId, job.CreditsUsed);

            job.Status = "failed";
            job.Error = ex.Message;
            job.CompletedAt = DateTimeOffset.UtcNow;
            await _db.SaveChangesAsync();

            throw;
        }
    }

    private async Task<List<Shot>> GenerateShotsFromScriptAsync(Guid projectId, string script, int shotCount)
    {

        // Mock AI implementation: split script into segments and generate basic shots
        // In real implementation, this would call an AI API (OpenAI, etc.)

        var existingShots = await _db.Shots
            .Where(s => s.ProjectId == projectId)
            .ToListAsync();

        var maxNumber = existingShots.Any() ? existingShots.Max(s => s.ShotNumber) : 0;

        var shots = new List<Shot>();
        var scriptSegments = SplitScriptIntoSegments(script, shotCount);

        var shotTypes = new[] { "远景", "全景", "中景", "近景", "特写" };

        for (int i = 0; i < shotCount; i++)
        {
            var segment = scriptSegments.ElementAtOrDefault(i) ?? $"镜头 {i + 1}";

            var shot = new Shot
            {
                Id = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() + i,
                ProjectId = projectId,
                ShotNumber = maxNumber + i + 1,
                Duration = 3.0 + (i % 3) * 2, // 3-7 seconds
                ShotType = shotTypes[i % shotTypes.Length],
                CoreContent = segment.Length > 100 ? segment.Substring(0, 100) + "..." : segment,
                ActionCommand = "",
                SceneSettings = "",
                FirstFramePrompt = $"AI generated: {segment.Substring(0, Math.Min(50, segment.Length))}",
                LastFramePrompt = "",
                VideoPrompt = "",
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

            shots.Add(shot);
        }

        return shots;
    }

    private List<string> SplitScriptIntoSegments(string script, int segments)
    {
        // Guard against invalid segment count
        if (segments <= 0)
            return new List<string> { script };

        // Split by both Chinese and English punctuation
        var sentences = script.Split(new[] { '。', '！', '？', '.', '!', '?', '\n', '\r' }, StringSplitOptions.RemoveEmptyEntries)
            .Where(s => s.Trim().Length > 0)
            .ToList();

        if (sentences.Count == 0)
        {
            // If no punctuation found, split by word count
            var words = script.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (words.Length == 0)
                return new List<string> { script };

            var wordsPerSegment = Math.Max(1, words.Length / segments);
            var wordResult = new List<string>();
            for (int i = 0; i < segments && i * wordsPerSegment < words.Length; i++)
            {
                var segmentWords = words.Skip(i * wordsPerSegment).Take(wordsPerSegment);
                wordResult.Add(string.Join(" ", segmentWords));
            }
            return wordResult;
        }

        if (sentences.Count <= segments)
            return sentences;

        // Combine sentences to reach target segments
        var result = new List<string>();
        var perSegment = Math.Max(1, sentences.Count / segments);

        for (int i = 0; i < segments; i++)
        {
            var start = i * perSegment;
            var end = (i == segments - 1) ? sentences.Count : start + perSegment;
            var segmentText = string.Join("", sentences.Skip(start).Take(end - start));
            result.Add(segmentText);
        }

        return result;
    }

    public async Task<GenerationJob?> GetJobAsync(Guid jobId, Guid userId)
    {
        return await _db.GenerationJobs
            .FirstOrDefaultAsync(j => j.Id == jobId && j.UserId == userId);
    }

    public async Task<List<GenerationJob>> GetUserJobsAsync(Guid userId)
    {
        // SQLite workaround: sort in memory
        var jobs = await _db.GenerationJobs
            .Where(j => j.UserId == userId)
            .ToListAsync();

        return jobs.OrderByDescending(j => j.CreatedAt).Take(20).ToList();
    }
}

internal sealed class StoryboardInput
{
    [System.Text.Json.Serialization.JsonPropertyName("script")]
    public string Script { get; set; } = "";

    [System.Text.Json.Serialization.JsonPropertyName("shotCount")]
    public int ShotCount { get; set; }
}