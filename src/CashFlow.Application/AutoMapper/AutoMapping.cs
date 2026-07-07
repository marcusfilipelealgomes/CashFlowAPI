using AutoMapper;
using CashFlow.Communication.Requests;
using CashFlow.Communication.Responses;
using CashFlow.Domain.Entities;

namespace CashFlow.Application.AutoMapper;
public class AutoMapping : Profile // Esta é a classe de configuração do AutoMapper, que define os mapeamentos entre as entidades e os DTOs.
{
    public AutoMapping()
    {
        RequestToEntity();
        EntityToResponse();
    }

    private void RequestToEntity() 
    {
        CreateMap<RequestRegisterExpenseJson, Expense>();
           
    }

    private void EntityToResponse() 
    {
        CreateMap<Expense, ResponseRegisteredExpenseJson>();
        CreateMap<Expense, ResponseShortExpenseJson>();
        CreateMap<Expense, ResponseExpenseJson>();
           
    }
}
