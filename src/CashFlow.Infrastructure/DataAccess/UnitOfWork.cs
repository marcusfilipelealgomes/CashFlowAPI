using CashFlow.Domain.Repositories;
using CashFlow.Infrastructure.DataAccess.Repositories;

namespace CashFlow.Infrastructure.DataAccess;
internal class UnitOfWork : IUnitOfWork
{
    private readonly CashFlowDBContext _dbContext;

    public UnitOfWork(CashFlowDBContext dBContext)
    {
        _dbContext = dBContext;
    }

    public async Task Commit()
    {
        await _dbContext.SaveChangesAsync();
    }
}
