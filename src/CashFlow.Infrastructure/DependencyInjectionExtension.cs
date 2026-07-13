using CashFlow.Domain.Repositories;
using CashFlow.Domain.Repositories.Expenses;
using CashFlow.Infrastructure.DataAccess;
using CashFlow.Infrastructure.DataAccess.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
namespace CashFlow.Infrastructure;
public static class DependencyInjectionExtension
{
    public static void AddInfrasTructure(this IServiceCollection services, IConfiguration configuration) // Aqui você pode adicionar a lógica para registrar os serviços da infraestrutura no contêiner de injeção de dependência.Por exemplo, você pode registrar repositórios, serviços de acesso a dados, etc.
    {
        AddRepositories(services);
        AddDbContext(services, configuration);
    }

    private static void AddRepositories(IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IExpensesReadOnlyRepository, ExpensesRepository>();
        services.AddScoped<IExpensesWriteOnlyRepository , ExpensesRepository>();
        services.AddScoped<IExpensesUpdateOnlyRepository , ExpensesRepository>();

    }


    private static void AddDbContext(IServiceCollection services, IConfiguration configuration)
    {

        var connectionString = configuration.GetConnectionString("DefaultConnection"); // Obtém a string de conexão do arquivo de configuração (appsettings.json) usando a chave "DefaultConnection".
        ;

        //optionsBuilder.UseSqlServer(connectionString);

        services.AddDbContext<CashFlowDBContext>(config => config.UseSqlServer(connectionString));
    }
}
