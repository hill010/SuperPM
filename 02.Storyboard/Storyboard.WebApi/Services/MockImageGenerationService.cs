namespace Storyboard.WebApi.Services;

/// <summary>
/// Mock implementation of image generation service.
/// Returns placeholder images from picsum.photos for development.
/// </summary>
public sealed class MockImageGenerationService : IImageGenerationService
{
    private readonly Random _random = new();

    public int CreditsPerImage => 20;

    public Task<ImageGenerationResult> GenerateImageAsync(
        string prompt,
        string? negativePrompt = null,
        string? aspectRatio = null)
    {
        // Simulate API delay
        Thread.Sleep(500 + _random.Next(1500));

        // Generate a placeholder image URL based on prompt hash
        var seed = Math.Abs(prompt.GetHashCode() % 1000);
        var (width, height) = GetDimensions(aspectRatio);

        // Use picsum.photos for placeholder images
        var imageUrl = $"https://picsum.photos/seed/{seed}/{width}/{height}";

        return Task.FromResult(ImageGenerationResult.Succeeded(imageUrl, CreditsPerImage));
    }

    private static (int width, int height) GetDimensions(string? aspectRatio)
    {
        return aspectRatio?.ToLowerInvariant() switch
        {
            "16:9" or "1920x1080" => (640, 360),
            "9:16" or "1080x1920" => (360, 640),
            "4:3" => (640, 480),
            "3:4" => (480, 640),
            "1:1" or "square" => (512, 512),
            _ => (640, 360) // Default to 16:9
        };
    }
}