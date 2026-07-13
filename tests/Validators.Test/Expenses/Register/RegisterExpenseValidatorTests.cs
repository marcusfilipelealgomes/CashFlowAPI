using CashFlow.Application.UseCases.Expenses;
using CashFlow.Application.UseCases.Expenses.Register;
using CashFlow.Communication.Enums;
using CashFlow.Communication.Requests;
using CashFlow.Exception;
using CommonTestUtilities.Request;
using FluentAssertions;

namespace Validators.Test.Expenses.Register;
public class RegisterExpenseValidatorTests
{
    [Fact] 
    public void Sucess()
    {
        //Arrange
        var validator = new ExpenseValidator();
        var request = RequestRegisterExpenseJsonBuilder.Build();   // Cria um objeto de request com dados válidos usando o builder

        //Act
        var result = validator.Validate(request);

        //Assert
        result.IsValid.Should().BeTrue(); // Verifica se o resultado da validação é válido, se for, o teste passa, caso contrário, o teste falha.  
    } 



    [Theory]
    [InlineData("")]
    [InlineData("      ")]
    [InlineData(null)]
    public void Error_Tittle_Empty(string tittle)
    {
        //Arrange
        var validator = new ExpenseValidator();
        var request = RequestRegisterExpenseJsonBuilder.Build();   // Cria um objeto de request com dados válidos usando o builder
        request.Title = tittle; // Define o título como vazio para simular um cenário de erro 

        //Act
        var result = validator.Validate(request);

        //Assert
        result.IsValid.Should().BeFalse(); // Verifica se o resultado da validação é válido, se for, o teste passa, caso contrário, o teste falha. 
        result.Errors.Should().ContainSingle().And.Contain(e => e.ErrorMessage.Equals(ResourceErrorMesseges.TITLE_REQUIRED)); // Verifica se a mensagem de erro é a esperada, se for, o teste passa, caso contrário, o teste falha.
    }



    [Fact]
    public void Error_Date_Futurey()
    {
        //Arrange
        var validator = new ExpenseValidator();
        var request = RequestRegisterExpenseJsonBuilder.Build();   // Cria um objeto de request com dados válidos usando o builder
        request.Date = DateTime.UtcNow.AddDays(1); // Define a data como uma data futura para simular um cenário de erro

        //Act
        var result = validator.Validate(request);

        //Assert
        result.IsValid.Should().BeFalse(); // Verifica se o resultado da validação é válido, se for, o teste passa, caso contrário, o teste falha. 
        result.Errors.Should().ContainSingle().And.Contain(e => e.ErrorMessage.Equals(ResourceErrorMesseges.EXPENSES_CANNOT_FOR_THE_FUTURE)); // Verifica se a mensagem de erro é a esperada, se for, o teste passa, caso contrário, o teste falha.
    }



    [Fact]
    public void Error_Payment_Type_Invalid()
    {
        //Arrange
        var validator = new ExpenseValidator();
        var request = RequestRegisterExpenseJsonBuilder.Build();   // Cria um objeto de request com dados válidos usando o builder
        request.PaymentType = (PaymentType)700; // Define o tipo de pagamento como um valor inválido para simular um cenário de erro

        //Act
        var result = validator.Validate(request);

        //Assert
        result.IsValid.Should().BeFalse(); // Verifica se o resultado da validação é válido, se for, o teste passa, caso contrário, o teste falha. 
        result.Errors.Should().ContainSingle().And.Contain(e => e.ErrorMessage.Equals(ResourceErrorMesseges.PAYMENT_TYPE_INVALID)); // Verifica se a mensagem de erro é a esperada, se for, o teste passa, caso contrário, o teste falha.
    }



    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    [InlineData(-2)]
    [InlineData(-7)]
    public void Error_Amount_Invalid(decimal amount)
    {
        //Arrange
        var validator = new ExpenseValidator();
        var request = RequestRegisterExpenseJsonBuilder.Build();   // Cria um objeto de request com dados válidos usando o builder
        request.Amount = amount; // Define a data como uma data futura para simular um cenário de erro

        //Act
        var result = validator.Validate(request);

        //Assert
        result.IsValid.Should().BeFalse(); // Verifica se o resultado da validação é válido, se for, o teste passa, caso contrário, o teste falha. 
        result.Errors.Should().ContainSingle().And.Contain(e => e.ErrorMessage.Equals(ResourceErrorMesseges.AMOUNT_MUST_BE_GREATER_THAN_ZERO)); // Verifica se a mensagem de erro é a esperada, se for, o teste passa, caso contrário, o teste falha.
    }
}
 





// O TESTE DEVE SER FEITO PARA VER SE O VALIDADOR ESTÁ FUNCIONANDO CORRETAMENTE, PARA ISSO, VOCÊ DEVE CRIAR UM OBJETO DE REQUEST COM DADOS VÁLIDOS E CHAMAR O MÉTODO DE VALIDAÇÃO, SE O RESULTADO FOR VÁLIDO, O TESTE PASSA, CASO CONTRÁRIO, O TESTE FALHA.

// USO O FACT PARA CRIAR UM TESTE, O FACT É UM ATRIBUTO DO XUNIT QUE INDICA QUE O MÉTODO É UM TESTE, ELE NÃO RECEBE PARÂMETROS E NÃO RETORNA NADA, ELE SIMPLESMENTE EXECUTA O CÓDIGO DENTRO DO MÉTODO E VERIFICA SE O RESULTADO É O ESPERADO.

// O ARRANGE É A PARTE ONDE VOCÊ PREPARA O CENÁRIO PARA O TESTE, NESSA PARTE VOCÊ CRIA O OBJETO DO VALIDADOR E O OBJETO DE REQUEST COM DADOS VÁLIDOS, PARA ISSO, VOCÊ PODE USAR O BUILDER QUE VOCÊ CRIOU PARA GERAR UM OBJETO DE REQUEST COM DADOS VÁLIDOS.