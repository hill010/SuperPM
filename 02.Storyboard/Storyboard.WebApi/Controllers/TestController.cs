using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Storyboard.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class TestController : ControllerBase
{
    [HttpGet("public")]
    public IActionResult PublicEndpoint()
    {
        return Ok(new { message = "Public endpoint works", time = DateTime.UtcNow });
    }

    [HttpGet("protected")]
    [Authorize]
    public IActionResult ProtectedEndpoint()
    {
        return Ok(new { message = "Protected endpoint works", user = User.Identity?.Name ?? "unknown" });
    }
}