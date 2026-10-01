using CashFlow.Communication.Requests;
using CashFlow.Domain.Enums;
using CashFlow.Domain.Repositories;
using CashFlow.Domain.Repositories.Expenses;
using CashFlow.Exception;
using CashFlow.Exception.ExceptionBase;

namespace CashFlow.Application.UseCases.Expenses.UpdateStatus;
public class UpdateExpenseStatusUseCase : IUpdateExpenseStatusUseCase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IExpensesUpdateOnlyRepository _repository;

    public UpdateExpenseStatusUseCase(IUnitOfWork unitOfWork, IExpensesUpdateOnlyRepository repository)
    {
        _unitOfWork = unitOfWork;
        _repository = repository;
    }

    public async Task Execute(long id, RequestExpenseStatusJson request)
    {
        if (Enum.IsDefined(request.Status) == false)
        {
            throw new ErrorOnValidationExpection([ResourceErrorMesseges.STATUS_INVALID]);
        }

        var expense = await _repository.GetById(id);

        if (expense is null)
        {
            throw new NotFoundException(ResourceErrorMesseges.EXPENSE_NOT_FOUND);
        }

        expense.Status = (ExpenseStatus)request.Status;

        _repository.Update(expense);

        await _unitOfWork.Commit();
    }
}
