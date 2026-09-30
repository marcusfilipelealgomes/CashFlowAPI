using CashFlow.Domain.Entities;
using CashFlow.Domain.Services.LoggedUser;
using CashFlow.Infrastructure.DataAccess;
using Microsoft.EntityFrameworkCore;

namespace CashFlow.Infrastructure.Services.LoggedUser;

/// <summary>
/// Enquanto a API não possui autenticação, todas as despesas pertencem a um único usuário padrão,
/// criado automaticamente na primeira vez que for necessário.
/// </summary>
internal class DefaultLoggedUser : ILoggedUser
{
    private const string DefaultUserEmail = "usuario.padrao@cashflow.local";

    private readonly CashFlowDBContext _dbContext;

    public DefaultLoggedUser(CashFlowDBContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<User> Get()
    {
        var user = await _dbContext.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email == DefaultUserEmail);

        if (user is not null)
            return user;

        user = new User
        {
            Name = "Usuário Padrão",
            Email = DefaultUserEmail,
            Password = string.Empty,
            UserIdentifier = Guid.NewGuid(),
            Role = "admin",
        };

        await _dbContext.Users.AddAsync(user);
        await _dbContext.SaveChangesAsync();

        return user;
    }
}
