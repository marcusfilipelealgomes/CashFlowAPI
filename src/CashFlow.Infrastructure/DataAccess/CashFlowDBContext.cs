using CashFlow.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;

namespace CashFlow.Infrastructure.DataAccess;
internal class CashFlowDBContext : DbContext
{
    public CashFlowDBContext(DbContextOptions options) : base(options){    }

    public DbSet<Expense> Expenses { get; set; }
    public DbSet<User> Users { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(user =>
        {
            user.ToTable("User");
            user.Property(u => u.Role).HasColumnName("role");
        });
    }
}
