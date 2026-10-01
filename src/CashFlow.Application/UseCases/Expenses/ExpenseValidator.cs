using CashFlow.Communication.Requests;
using CashFlow.Exception;
using FluentValidation;

namespace CashFlow.Application.UseCases.Expenses;
public class ExpenseValidator : AbstractValidator<RequestExpenseJson>
{
    public ExpenseValidator() // faz informar todas as mensagens de erro, caso haja mais de um erro, ele mostra todos os erros, diferente do if, que só mostra o primeiro erro encontrado.
    {
        RuleFor(expense => expense.Title).NotEmpty().WithMessage(ResourceErrorMesseges.TITLE_REQUIRED);
        RuleFor(expense => expense.Amount).GreaterThan(0).WithMessage(ResourceErrorMesseges.AMOUNT_MUST_BE_GREATER_THAN_ZERO);
        RuleFor(expense => expense.PaymentType).IsInEnum().WithMessage(ResourceErrorMesseges.PAYMENT_TYPE_INVALID);
        RuleFor(expense => expense.Status).IsInEnum().WithMessage(ResourceErrorMesseges.STATUS_INVALID);
    }
}
 