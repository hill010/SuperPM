using Microsoft.AspNetCore.SignalR;
using Storyboard.WebApi.Hubs;

namespace Storyboard.WebApi.Services;

public sealed class JobNotificationService : IJobNotificationService
{
    private readonly IHubContext<GenerationHub> _hubContext;
    private readonly ILogger<JobNotificationService> _logger;

    public JobNotificationService(IHubContext<GenerationHub> hubContext, ILogger<JobNotificationService> logger)
    {
        _hubContext = hubContext;
        _logger = logger;
    }

    public async Task NotifyJobCreatedAsync(Guid userId, Guid jobId, string jobType, Guid? shotId = null, int? shotNumber = null)
    {
        await SendAsync(userId, "JobCreated", new { jobId, jobType, shotId, shotNumber, status = "queued", createdAt = DateTimeOffset.UtcNow });
        _logger.LogDebug("Notified JobCreated: {JobId}", jobId);
    }

    public async Task NotifyJobStartedAsync(Guid userId, Guid jobId)
    {
        await SendAsync(userId, "JobStarted", new { jobId, status = "running", startedAt = DateTimeOffset.UtcNow });
        _logger.LogDebug("Notified JobStarted: {JobId}", jobId);
    }

    public async Task NotifyJobProgressAsync(Guid userId, Guid jobId, int progress, string message)
    {
        await SendAsync(userId, "JobProgress", new { jobId, progress, message });
        _logger.LogDebug("Notified JobProgress: {JobId} - {Progress}%", jobId, progress);
    }

    public async Task NotifyJobCompletedAsync(Guid userId, Guid jobId, string? resultPath = null)
    {
        await SendAsync(userId, "JobCompleted", new { jobId, status = "succeeded", resultPath, completedAt = DateTimeOffset.UtcNow });
        _logger.LogDebug("Notified JobCompleted: {JobId}", jobId);
    }

    public async Task NotifyJobFailedAsync(Guid userId, Guid jobId, string error)
    {
        await SendAsync(userId, "JobFailed", new { jobId, status = "failed", error, completedAt = DateTimeOffset.UtcNow });
        _logger.LogDebug("Notified JobFailed: {JobId}", jobId);
    }

    private async Task SendAsync<T>(Guid userId, string eventName, T data)
    {
        await _hubContext.Clients.Group($"user-{userId}").SendAsync(eventName, data);
    }
}
