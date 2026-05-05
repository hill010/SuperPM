using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Storyboard.WebApi.Data;
using Storyboard.WebApi.Hubs;
using Storyboard.WebApi.Services;

var builder = WebApplication.CreateBuilder(args);

// Database (SQLite for dev, PostgreSQL for prod)
var dbProvider = builder.Configuration["Database:Provider"] ?? "Sqlite";
builder.Services.AddDbContext<WebDbContext>(options =>
{
    if (dbProvider == "Postgres")
        options.UseNpgsql(builder.Configuration.GetConnectionString("Default"));
    else
        options.UseSqlite(builder.Configuration.GetConnectionString("Sqlite")
            ?? "Data Source=storyboard-web.db");
});

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IWorkspaceService, WorkspaceService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IShotService, ShotService>();
builder.Services.AddScoped<ICreditService, CreditService>();
builder.Services.AddScoped<IStoryboardAIService, StoryboardAIService>();
builder.Services.AddScoped<IImageGenerationService>(sp =>
{
    var configuration = sp.GetRequiredService<IConfiguration>();
    var provider = configuration["ImageGeneration:Provider"] ?? "Mock";

    if (provider == "OpenAI" && !string.IsNullOrEmpty(configuration["OpenAI:ApiKey"]))
    {
        return new OpenAIImageGenerationService(
            sp.GetRequiredService<IHttpClientFactory>(),
            configuration,
            sp.GetRequiredService<ILogger<OpenAIImageGenerationService>>());
    }

    return new MockImageGenerationService();
});

builder.Services.AddHttpClient();
builder.Services.AddScoped<IExportService, ExportService>();
builder.Services.AddScoped<IJobNotificationService, JobNotificationService>();

// Authentication
var jwtKey = builder.Configuration["Jwt:Key"] ?? "dev-secret-key-change-in-production-min-32-chars!!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "StoryboardWeb",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "StoryboardWeb",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Configure JWT for SignalR
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

// SignalR
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
                ?? new[] { "http://localhost:3000" })
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers();

var app = builder.Build();

// Auto-create database in development
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<WebDbContext>();
    db.Database.EnsureCreated();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<GenerationHub>("/hubs/generation");

app.Run();