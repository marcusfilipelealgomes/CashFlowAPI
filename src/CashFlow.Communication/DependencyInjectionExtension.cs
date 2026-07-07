//using Microsoft.Extensions.DependencyInjection;

//namespace CashFlow.Communication;
//public static class DependencyInjectionExtension
//{
//    public static void AddApplication(this IServiceCollection services) // Aqui você pode adicionar a lógica para registrar os serviços da aplicação no contêiner de injeção de dependência.Por exemplo, você pode registrar casos de uso, serviços de aplicação, etc.
//    {
//        AddAutoMapper(services);
//        AddUseCases(services);
//    }
//    private static void AddAutoMapper(IServiceCollection services)
//    {
//        services.AddAutoMapper(cfg => { }, typeof(string).Assembly);
//    }

//    private static void AddUseCases(IServiceCollection services)
//    {
//        //services.AddScoped<IRegisterExpenseUseCase, RegisterExpenseUseCase>();
//    }
//}
