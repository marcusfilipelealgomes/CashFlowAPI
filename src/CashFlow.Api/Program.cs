using CashFlow.Api.Filters;
using CashFlow.Application;
using CashFlow.Communication;
using CashFlow.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();


builder.Services.AddMvc(options => options.Filters.Add(typeof(ExceptionFilter)));

builder.Services.AddInfrasTructure(builder.Configuration); // Adiciona a infraestrutura ao contêiner de serviços, registrando os serviços necessários para a aplicação.
builder.Services.AddApplication(); // Adiciona a camada de aplicação ao contêiner de serviços, registrando os casos de uso e serviços relacionados à lógica de negócios.    



var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(); 
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
