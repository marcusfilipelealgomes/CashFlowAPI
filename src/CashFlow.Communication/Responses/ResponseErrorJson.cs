namespace CashFlow.Communication.Responses;
public class ResponseErrorJson
{
    public  List<string> ErrorMessages { get; set; }
    public object Expenses { get; set; }

    public ResponseErrorJson(string errorMessege)
    {
        ErrorMessages = [errorMessege];
    }

    public ResponseErrorJson(List<string> errorMessage)
    {
        ErrorMessages = errorMessage;
    }
}
