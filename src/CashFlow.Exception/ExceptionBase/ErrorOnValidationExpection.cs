using System.ComponentModel;
using System.Net;

namespace CashFlow.Exception.ExceptionBase;
public class ErrorOnValidationExpection : CashFlowException // essa classe é uma exceção personalizada que herda de CashFlowException, indicando que é um tipo específico de erro relacionado à validação. Ela pode ser usada para lançar erros específicos quando ocorrerem problemas de validação em diferentes partes do sistema, permitindo uma melhor organização e tratamento de erros relacionados à validação.
{
    private readonly List<string> _errors;

    public override int StatusCode => (int)HttpStatusCode.BadRequest;

    public ErrorOnValidationExpection(List<string> errorMessages) : base(string.Empty)
    {
        _errors = errorMessages;
    }

    public override List<string> GetErrors()
    {
        return _errors;
    }
}
