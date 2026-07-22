namespace CashFlow.Application.UseCases.Expenses.Report.Excel;
public interface IGenereteExpensesReportExcelUseCase
{
    Task<byte[]> Execute(DateOnly month);

}
