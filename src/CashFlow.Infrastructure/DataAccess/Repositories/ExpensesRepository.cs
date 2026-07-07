using CashFlow.Domain.Entities;
using CashFlow.Domain.Repositories.Expenses;
using Microsoft.EntityFrameworkCore;

namespace CashFlow.Infrastructure.DataAccess.Repositories;
internal class ExpensesRepository : IExpensesReadOnlyRepository, IExpensesWriteOnlyRepository
{
    private readonly CashFlowDBContext _dbContext;

    public ExpensesRepository(CashFlowDBContext dBContext)
    {
        _dbContext = dBContext;
    }

    public async Task Add(Expense expenses)
    {
       await _dbContext.Expenses.AddAsync(expenses);
    }

    public async Task<List<Expense>> GetAll()
    {
       return await _dbContext.Expenses.ToListAsync();
    }

    public async Task<Expense?> GetById(long id)
    {
        return await _dbContext.Expenses.AsNoTracking().FirstOrDefaultAsync(expense => expense.Id == id);
    }
}
