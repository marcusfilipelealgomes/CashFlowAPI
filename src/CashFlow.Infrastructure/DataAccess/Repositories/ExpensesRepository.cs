using CashFlow.Domain.Entities;
using CashFlow.Domain.Repositories.Expenses;
using Microsoft.EntityFrameworkCore;

namespace CashFlow.Infrastructure.DataAccess.Repositories;
internal class ExpensesRepository : IExpensesReadOnlyRepository, IExpensesWriteOnlyRepository, IExpensesUpdateOnlyRepository
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

    public Task<bool> Delete(long id)
    {
        var result = _dbContext.Expenses.FirstOrDefault(expense => expense.Id == id );

        if (result is null)
        {
            return Task.FromResult(false);
        }

        _dbContext.Expenses.Remove(result);

        return Task.FromResult(true);
    }

    public async Task<List<Expense>> GetAll()
    {
       return await _dbContext.Expenses.ToListAsync();
    }

    async Task<Expense?> IExpensesReadOnlyRepository.GetById(long id)
    {
        return await _dbContext.Expenses.AsNoTracking().FirstOrDefaultAsync(expense => expense.Id == id);
    }

    async Task<Expense?> IExpensesUpdateOnlyRepository.GetById(long id)
    {
        return await _dbContext.Expenses.FirstOrDefaultAsync(expense => expense.Id == id);
    }

    public void Update(Expense expense)
    {
        _dbContext.Expenses.Update(expense);
    }

    public async Task<List<Expense>> FilterByMonth(DateOnly date)
    {
        var startDate = new DateTime(year: date.Year, month: date.Month, day: 1).Date;

        var daysInMonth = DateTime.DaysInMonth(year: date.Year, month: date.Month);
        var endDate = new DateTime(year: date.Year, month: date.Month, day: daysInMonth, hour: 23, minute: 59, second: 59).Date;

        return await _dbContext
           .Expenses
           .AsNoTracking()
           .Where(expense => expense.Date >= startDate && expense.Date <= endDate)
           .OrderBy(expense => expense.Date)
           .ThenBy(expense => expense.Title)
           .ToListAsync();
    } 
}
