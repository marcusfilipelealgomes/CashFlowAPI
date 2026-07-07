using Bogus;
using CashFlow.Communication.Enums;
using CashFlow.Communication.Requests;
using System.Security.Cryptography.X509Certificates;

namespace CommonTestUtilities.Request;
public class RequestRegisterExpenseJsonBuilder
{
    public static  RequestRegisterExpenseJson Build()
        {

        return new Faker<RequestRegisterExpenseJson>()
            .RuleFor(r => r.Title, f => f.Commerce.ProductName())
            .RuleFor(r => r.Amount, f => f.Random.Decimal(1, 1000)) // Gerar um valor decimal aleatório entre 1 e 1000 para o campo Amount
            .RuleFor(r => r.Description, f => f.Commerce.ProductDescription())
            .RuleFor(r => r.Date, f => f.Date.Past())
            .RuleFor(r => r.PaymentType, f => f.PickRandom<PaymentType>()); // Gerar dados aleatórios para o objeto RequestRegisterExpenseJson usando a biblioteca Bogus
    }
  
}
