using AutoMapper;
using CashFlow.Communication.Requests;
using CashFlow.Communication.Responses;
using CashFlow.Domain.Entities;
using CashFlow.Domain.Repositories;
using CashFlow.Domain.Repositories.Expenses;
using CashFlow.Exception.ExceptionBase;

namespace CashFlow.Application.UseCases.Expenses.Register;
public class RegisterExpenseUseCase : IRegisterExpenseUseCase
{
	private readonly IExpensesWriteOnlyRepository _repository;
	private readonly IUnitOfWork _unitOfWork;
	private readonly IMapper _mapper;

    public RegisterExpenseUseCase(
        IExpensesWriteOnlyRepository repository, 
		IUnitOfWork unitOfWork,
		IMapper mapper)
    {
        _repository = repository;
		_unitOfWork = unitOfWork;
		_mapper = mapper;
    }

    public async Task<ResponseRegisteredExpenseJson> Execute(RequestExpenseJson request)
		 {
			//TO DO VALIDATIONS
			Validate(request);

			var entity = _mapper.Map<Expense>(request);

			await _repository.Add(entity);

			await _unitOfWork.Commit();

			return _mapper.Map<ResponseRegisteredExpenseJson>(entity);
		}


		private void Validate(RequestExpenseJson request) 
		{
			var validator = new ExpenseValidator();

			var result = validator.Validate(request);

				 if (result.IsValid == false)
				{
					var errorMessages = result.Errors.Select(f => f.ErrorMessage).ToList();
	
					 throw new ErrorOnValidationExpection(errorMessages); 
				}
		}   
}

// NUGGET PACHET - É UM GERENCIADOR DE BIBLIOTECAS, DISPONIVEL PARA TODA PLATAFORMA .NET, ELE PERMITE GERENCIAR AS DEPENDÊNCIAS DO PROJETO DE FORMA SIMPLES E EFICIENTE.
// COM O NUGET, VOCÊ PODE INSTALAR, ATUALIZAR E REMOVER BIBLIOTECAS DE TERCEIROS COM FACILIDADE, GARANTINDO QUE SEU PROJETO ESTEJA SEMPRE ATUALIZADO E FUNCIONAL. 


//ATRAVES DO VALIDATOR, VOCÊ PODE DEFINIR REGRAS DE VALIDAÇÃO PARA OS DADOS DE ENTRADA, ASSEGURANDO QUE OS DADOS SEJAM VÁLIDOS ANTES DE SEREM PROCESSADOS.
//ISSO AJUDA A PREVENIR ERROS E GARANTE QUE O SISTEMA FUNCIONE CORRETAMENTE. O FLUENTVALIDATION É UMA BIBLIOTECA POPULAR PARA REALIZAR ESSA TAREFA DE FORMA
//SIMPLES E EFICIENTE. AO INVES DE USAR IF EM TODAS.

 
//UMA INTERFACE É UM CONTRATO QUE DEFINE UM CONJUNTO DE MÉTODOS, PROPRIEDADES E EVENTOS QUE UMA CLASSE DEVE IMPLEMENTAR. ELA PERMITE QUE DIFERENTES
//CLASSES POSSAM SER TRATADAS DE FORMA UNIFORME, MESMO QUE TENHAM IMPLEMENTAÇÕES DIFERENTES. ISSO PROMOVE A FLEXIBILIDADE E A REUTILIZAÇÃO DE CÓDIGO,
//POIS VOCÊ PODE USAR POLIMORFISMO PARA TRATAR OBJETOS DE DIFERENTES CLASSES COMO SE FOSSEM DO MESMO TIPO, DESDE QUE IMPLEMENTEM A MESMA INTERFACE.