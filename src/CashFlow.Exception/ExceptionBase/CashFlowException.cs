namespace CashFlow.Exception.ExceptionBase;

public abstract class CashFlowException : SystemException //precisa ter essa herança para ser tratada como uma exceção, e não como um erro de compilação, ou seja, é necessário herdar de SystemException para que a classe seja reconhecida como uma exceção personalizada e possa ser lançada e capturada corretamente em tempo de execução.
{
    protected CashFlowException(string message) : base(message)
    {
        
    }
}
