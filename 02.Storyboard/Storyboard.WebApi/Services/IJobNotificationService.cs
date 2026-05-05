namespace Storyboard.WebApi.Services;

public interface IJobNotificationService
{
    Task NotifyJobCreatedAsync(Guid userId, Guid jobId, string jobType, Guid? shotId = null, int? shotNumber = null);
    Task NotifyJobStartedAsync(Guid userId, Guid jobId);
    Task NotifyJobProgressAsync(Guid userId, Guid jobId, int progress, string message);
    Task NotifyJobCompletedAsync(Guid userId, Guid jobId, string? resultPath = null);
    Task NotifyJobFailedAsync(Guid userId, Guid jobId, string error);
}
