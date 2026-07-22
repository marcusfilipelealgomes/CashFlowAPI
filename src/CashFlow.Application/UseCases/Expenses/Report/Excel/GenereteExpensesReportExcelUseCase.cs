using CashFlow.Domain.Enums;
using CashFlow.Domain.Reports;
using CashFlow.Domain.Repositories.Expenses;
using ClosedXML.Excel;

namespace CashFlow.Application.UseCases.Expenses.Report.Excel;
public class GenereteExpensesReportExcelUseCase : IGenereteExpensesReportExcelUseCase
{
    private const string CURRENCY_SYBOL = "R$";
    private readonly IExpensesReadOnlyRepository _repository; 

    public GenereteExpensesReportExcelUseCase(IExpensesReadOnlyRepository repository) // Recebe o repositório de despesas como dependência
    {
        _repository = repository;
    }

    public async Task<byte[]> Execute(DateOnly month) // Recebe o mês que será filtrado
    {
        var expenses = await _repository.FilterByMonth(month);

        if (expenses.Count == 0)
            return [];


        using var workbook = new XLWorkbook(); // Como se fosse um arquivo Excel em branco

        workbook.Author = "Marcus";
        workbook.Style.Font.FontSize = 12;
        workbook.Style.Font.FontName = "Arial";

        var worksheet = workbook.Worksheets.Add(month.ToString("Y"));

        InserHeader(worksheet);

        var raw = 2;
        foreach (var expense in expenses) // Percorre a lista de despesas e insere os dados na planilha
        {
            worksheet.Cell($"A{raw}").Value = expense.Title;
            worksheet.Cell($"B{raw}").Value = expense.Date;
            worksheet.Cell($"C{raw}").Value = ConvertPaymentType(expense.PaymentType);

            worksheet.Cell($"D{raw}").Value = expense.Amount;
            worksheet.Cell($"D{raw}").Style.NumberFormat.Format = $"-{CURRENCY_SYBOL} #,##0.00";


            worksheet.Cell($"E{raw}").Value = expense.Description;
            
            raw++;
        }

        worksheet.Columns().AdjustToContents(); // Ajusta a largura das colunas de acordo com o conteúdo

        var file = new MemoryStream();
        workbook.SaveAs(file);

     
        return file.ToArray();
    }

    private string ConvertPaymentType(PaymentType payment) // Converte o tipo de pagamento para uma string legível
    {
        return payment switch
        {
            PaymentType.Cash => "Dinheiro",
            PaymentType.CreditCard => "Cartão de Crédito",
            PaymentType.DebitCard => "Cartão de Débito",
            PaymentType.EletronicTransfer => "Transferência Eletrônica",
            _ => string.Empty
        };
    }

    private void InserHeader(IXLWorksheet worksheet) // Insere o cabeçalho da planilha
    {
        worksheet.Cell("A1").Value = ResourceReportGenerationMessages.TITTLE;
        worksheet.Cell("B1").Value = ResourceReportGenerationMessages.DATE;
        worksheet.Cell("C1").Value = ResourceReportGenerationMessages.PAYMENT_TYPE;
        worksheet.Cell("D1").Value = ResourceReportGenerationMessages.AMOUNT;
        worksheet.Cell("E1").Value = ResourceReportGenerationMessages.DESCRIPTION;

        worksheet.Cells("A1:E1").Style.Font.Bold = true;

        worksheet.Cells("A1:E1").Style.Fill.BackgroundColor = XLColor.FromHtml("#F5C2B6");

        worksheet.Cell("A1").Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        worksheet.Cell("B1").Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        worksheet.Cell("C1").Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        worksheet.Cell("E1").Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Center);
        worksheet.Cell("D1").Style.Alignment.SetHorizontal(XLAlignmentHorizontalValues.Right);

    }

}
