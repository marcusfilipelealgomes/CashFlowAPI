using CashFlow.Communication.Requests;

namespace CashFlow.Application.UseCases.Expenses.UpdateStatus;
public interface IUpdateExpenseStatusUseCase
{
    Task Execute(long id, RequestExpenseStatusJson request);
}
