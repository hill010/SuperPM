namespace Storyboard.WebApi.Services;

public interface IImageGenerationService
{
    /// <summary>
    /// Generate an image from a prompt.
    /// </summary>
    /// <param name="prompt">The image generation prompt</param>
    /// <param name="negativePrompt">Optional negative prompt</param>
    /// <param name="aspectRatio">Image aspect ratio (e.g., "16:9", "9:16", "1:1")</param>
    /// <returns>URL of the generated image (or placeholder for mock)</returns>
    Task<ImageGenerationResult> GenerateImageAsync(
        string prompt,
        string? negativePrompt = null,
        string? aspectRatio = null);

    /// <summary>
    /// Get the cost in credits for generating one image.
    /// </summary>
    int CreditsPerImage => 20;
}

public sealed class ImageGenerationResult
{
    public bool Success { get; init; }
    public string? ImageUrl { get; init; }
    public string? Error { get; init; }
    public int CreditsUsed { get; init; }

    public static ImageGenerationResult Succeeded(string imageUrl, int creditsUsed = 20)
        => new() { Success = true, ImageUrl = imageUrl, CreditsUsed = creditsUsed };

    public static ImageGenerationResult Failed(string error)
        => new() { Success = false, Error = error, CreditsUsed = 0 };
}