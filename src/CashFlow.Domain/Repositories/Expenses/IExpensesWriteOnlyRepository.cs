using CashFlow.Domain.Entities;

namespace CashFlow.Domain.Repositories.Expenses;
public interface IExpensesWriteOnlyRepository
{
    Task Add(Expense expenses);
    /// <summary>
    /// Esta função retorna true se o processo de remover uma despesa foi um sucesso, caso contrario, retona falso.
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    Task<bool> Delete(long id);
}
