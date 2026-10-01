# CashFlow

Controle de despesas mensais: API em .NET 8 + SQL Server e frontend em Angular.

## Como rodar

Pré-requisitos: .NET 8 SDK, Node.js e o SQL Server configurado em `src/CashFlow.Api/appsettings.Development.json`.

O schema do banco é mantido manualmente: os scripts em `scripts/` devem ser aplicados em ordem (ex.: `001-add-expense-status.sql` cria a coluna `Status` usada para contas "A vencer").

- **Jeito mais rápido:** dê dois cliques em `iniciar.bat`.
- **Pelo terminal (na raiz do projeto):**

  ```powershell
  npm install   # só na primeira vez
  npm start
  ```

Os dois comandos sobem a API (`http://localhost:5118`) e o frontend (`http://localhost:4200`), que abre sozinho no navegador. Para encerrar, use `Ctrl+C` ou feche a janela.

Para rodar só a API: `npm run api` (ou `dotnet run --project src/CashFlow.Api --launch-profile http`).
