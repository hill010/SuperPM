using Microsoft.EntityFrameworkCore;
using Storyboard.WebApi.Models;

namespace Storyboard.WebApi.Data;

public sealed class WebDbContext : DbContext
{
    public WebDbContext(DbContextOptions<WebDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Workspace> Workspaces => Set<Workspace>();
    public DbSet<WorkspaceMember> WorkspaceMembers => Set<WorkspaceMember>();
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Shot> Shots => Set<Shot>();
    public DbSet<ShotAsset> ShotAssets => Set<ShotAsset>();
    public DbSet<GenerationJob> GenerationJobs => Set<GenerationJob>();
    public DbSet<CreditAccount> CreditAccounts => Set<CreditAccount>();
    public DbSet<CreditTransaction> CreditTransactions => Set<CreditTransaction>();
    public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<BillingEvent> BillingEvents => Set<BillingEvent>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.HasIndex(u => u.Email).IsUnique();
            b.Property(u => u.Email).HasMaxLength(256);
            b.Property(u => u.DisplayName).HasMaxLength(100);
        });

        modelBuilder.Entity<Workspace>(b =>
        {
            b.HasKey(w => w.Id);
            b.Property(w => w.Name).HasMaxLength(200);
            b.HasOne(w => w.Owner)
                .WithOne()
                .HasForeignKey<Workspace>(w => w.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<WorkspaceMember>(b =>
        {
            b.HasKey(m => m.Id);
            b.HasIndex(m => new { m.WorkspaceId, m.UserId }).IsUnique();
            b.HasOne(m => m.Workspace)
                .WithMany(w => w.Members)
                .HasForeignKey(m => m.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasOne(m => m.User)
                .WithMany()
                .HasForeignKey(m => m.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Project>(b =>
        {
            b.HasKey(p => p.Id);
            b.Property(p => p.Name).HasMaxLength(200);
            b.HasOne(p => p.Workspace)
                .WithMany(w => w.Projects)
                .HasForeignKey(p => p.WorkspaceId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(p => p.UpdatedAt);
        });

        modelBuilder.Entity<Shot>(b =>
        {
            b.HasKey(s => s.Id);
            b.HasIndex(s => new { s.ProjectId, s.ShotNumber }).IsUnique();
            b.HasOne(s => s.Project)
                .WithMany(p => p.Shots)
                .HasForeignKey(s => s.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ShotAsset>(b =>
        {
            b.HasKey(a => a.Id);
            b.Property(a => a.FilePath).IsRequired();
            b.HasOne(a => a.Shot)
                .WithMany(s => s.Assets)
                .HasForeignKey(a => a.ShotId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(a => new { a.ProjectId, a.ShotId, a.Type });
        });

        modelBuilder.Entity<GenerationJob>(b =>
        {
            b.HasKey(j => j.Id);
            b.HasIndex(j => new { j.UserId, j.Status });
            b.HasIndex(j => j.ProjectId);
        });

        modelBuilder.Entity<CreditAccount>(b =>
        {
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.UserId).IsUnique();
            b.HasOne(c => c.User)
                .WithOne()
                .HasForeignKey<CreditAccount>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CreditTransaction>(b =>
        {
            b.HasKey(t => t.Id);
            b.HasOne(t => t.Account)
                .WithMany(c => c.Transactions)
                .HasForeignKey(t => t.AccountId)
                .OnDelete(DeleteBehavior.Cascade);
            b.HasIndex(t => t.CreatedAt);
        });

        modelBuilder.Entity<Subscription>(b =>
        {
            b.HasKey(s => s.Id);
            b.HasIndex(s => s.UserId).IsUnique();
            b.HasOne(s => s.User)
                .WithOne()
                .HasForeignKey<Subscription>(s => s.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BillingEvent>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasIndex(e => e.UserId);
            b.HasIndex(e => e.StripeEventId);
        });
    }
}
