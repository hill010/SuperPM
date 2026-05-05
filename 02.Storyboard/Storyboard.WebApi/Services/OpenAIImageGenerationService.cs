using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Storyboard.WebApi.Services;

/// <summary>
/// OpenAI DALL-E image generation service.
/// Requires OpenAI API key configuration.
/// </summary>
public sealed class OpenAIImageGenerationService : IImageGenerationService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<OpenAIImageGenerationService> _logger;

    private const string DefaultModel = "dall-e-3";
    private const string DefaultSize = "1024x1024";
    private const string DefaultQuality = "standard";

    public int CreditsPerImage => 20;

    public OpenAIImageGenerationService(
        IHttpClientFactory httpClientFactory,
        IConfiguration configuration,
        ILogger<OpenAIImageGenerationService> logger)
    {
        _httpClient = httpClientFactory.CreateClient();
        _configuration = configuration;
        _logger = logger;

        var apiKey = configuration["OpenAI:ApiKey"];
        if (!string.IsNullOrEmpty(apiKey))
        {
            _httpClient.BaseAddress = new Uri("https://api.openai.com/v1/");
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        }
    }

    public async Task<ImageGenerationResult> GenerateImageAsync(
        string prompt,
        string? negativePrompt = null,
        string? aspectRatio = null)
    {
        var apiKey = _configuration["OpenAI:ApiKey"];
        if (string.IsNullOrEmpty(apiKey))
        {
            _logger.LogWarning("OpenAI API key not configured, falling back to mock");
            // Fall back to mock behavior
            var mockService = new MockImageGenerationService();
            return await mockService.GenerateImageAsync(prompt, negativePrompt, aspectRatio);
        }

        try
        {
            var size = GetSizeForAspectRatio(aspectRatio);
            var enhancedPrompt = EnhancePrompt(prompt, negativePrompt);

            var request = new
            {
                model = DefaultModel,
                prompt = enhancedPrompt,
                n = 1,
                size = size,
                quality = DefaultQuality,
                response_format = "url"
            };

            var response = await _httpClient.PostAsJsonAsync("images/generations", request);
            var responseBody = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("OpenAI API error: {StatusCode} - {Body}", response.StatusCode, responseBody);
                return new ImageGenerationResult
                {
                    Success = false,
                    Error = $"OpenAI API error: {response.StatusCode}"
                };
            }

            var result = JsonSerializer.Deserialize<OpenAIImageResponse>(responseBody);
            if (result?.Data == null || result.Data.Count == 0)
            {
                return new ImageGenerationResult
                {
                    Success = false,
                    Error = "No image returned"
                };
            }

            var imageUrl = result.Data[0].Url;
            if (string.IsNullOrEmpty(imageUrl))
            {
                return new ImageGenerationResult
                {
                    Success = false,
                    Error = "Image URL is empty"
                };
            }

            // Download and save image locally
            var localPath = await DownloadAndSaveImageAsync(imageUrl, Guid.NewGuid().ToString());

            return new ImageGenerationResult
            {
                Success = true,
                ImageUrl = localPath,
                CreditsUsed = CreditsPerImage
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Image generation failed");
            return new ImageGenerationResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }

    private string GetSizeForAspectRatio(string? aspectRatio)
    {
        return aspectRatio?.ToLowerInvariant() switch
        {
            "9:16" or "9x16" => "1024x1792",
            "16:9" or "16x9" => "1792x1024",
            "1:1" or "1x1" => "1024x1024",
            "4:3" or "4x3" => "1024x1024", // Closest available
            "3:4" or "3x4" => "1024x1024", // Closest available
            _ => DefaultSize
        };
    }

    private string EnhancePrompt(string prompt, string? negativePrompt)
    {
        var enhanced = prompt;

        if (!string.IsNullOrEmpty(negativePrompt))
        {
            // DALL-E 3 doesn't support negative prompts directly, so we append as style guidance
            enhanced = $"{prompt}. Style: Avoid {negativePrompt}";
        }

        // Add quality enhancements
        if (!enhanced.Contains("cinematic", StringComparison.OrdinalIgnoreCase) &&
            !enhanced.Contains("professional", StringComparison.OrdinalIgnoreCase))
        {
            enhanced = $"{enhanced}, cinematic lighting, high quality, professional photography";
        }

        // Truncate if too long (DALL-E has 4000 char limit)
        if (enhanced.Length > 3800)
        {
            enhanced = enhanced[..3800];
        }

        return enhanced;
    }

    private async Task<string> DownloadAndSaveImageAsync(string imageUrl, string fileName)
    {
        var imagesDir = Path.Combine(Directory.GetCurrentDirectory(), "generated_images");

        if (!Directory.Exists(imagesDir))
        {
            Directory.CreateDirectory(imagesDir);
        }

        var filePath = Path.Combine(imagesDir, $"{fileName}.png");

        var imageBytes = await _httpClient.GetByteArrayAsync(imageUrl);
        await File.WriteAllBytesAsync(filePath, imageBytes);

        return filePath;
    }

    private sealed class OpenAIImageResponse
    {
        [JsonPropertyName("data")]
        public List<OpenAIImageData>? Data { get; set; }
    }

    private sealed class OpenAIImageData
    {
        [JsonPropertyName("url")]
        public string? Url { get; set; }
    }
}
