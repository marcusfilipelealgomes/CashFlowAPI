using System.ComponentModel;

namespace CashFlow.Exception.ExceptionBase;
public class ErrorOnValidationExpection : CashFlowException // essa classe é uma exceção personalizada que herda de CashFlowException, indicando que é um tipo específico de erro relacionado à validação. Ela pode ser usada para lançar erros específicos quando ocorrerem problemas de validação em diferentes partes do sistema, permitindo uma melhor organização e tratamento de erros relacionados à validação.
{
    public List<string> Errors { get; private set; }

    public ErrorOnValidationExpection(List<string> errorMessages) : base(string.Empty)
    {
        Errors = errorMessages;
    }
}
