# CashFlow API 💰

O **CashFlow** é uma Web API desenvolvida em **ASP.NET Core (C#)** focada na gestão e controlo de despesas pessoais ou empresariais. A aplicação utiliza boas práticas de arquitetura de software, aplicando o padrão **Use Cases** (Casos de Uso) para manter a regra de negócio desacoplada, limpa e altamente testável.

---

## 🛠️ Tecnologias e Padrões

- **Plataforma:** .NET 8 / C#
- **Framework Web:** ASP.NET Core Web API
- **Arquitetura:** Clean Architecture / Use Cases Pattern
- **Injeção de Dependência:** Nativa do .NET (`[FromServices]`)
- **Documentação:** OpenAPI / Swagger

---

## 📐 Estrutura de Endpoints (`/api/expenses`)

A API disponibiliza operações de CRUD e atualização parcial para a gestão de despesas.

| Método | Endpoint | Descrição | Respostas HTTP |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/expenses` | Regista uma nova despesa no sistema. | `201 Created`, `400 Bad Request` |
| **GET** | `/api/expenses` | Recupera todas as despesas registadas. | `200 OK`, `204 No Content` |
| **GET** | `/api/expenses/{id}` | Procura uma despesa específica através do ID. | `200 OK`, `404 Not Found` |
| **PUT** | `/api/expenses/{id}` | Atualiza completamente os dados de uma despesa. | `204 No Content`, `400 Bad Request`, `404 Not Found` |
| **PATCH** | `/api/expenses/{id}/status` | Atualiza apenas o estado/status de uma despesa. | `204 No Content`, `400 Bad Request`, `404 Not Found` |
| **DELETE** | `/api/expenses/{id}` | Remove uma despesa do sistema por ID. | `204 No Content`, `404 Not Found` |

---

## 🚦 Detalhe dos Casos de Uso (Use Cases)

### 1. Criar Despesa
- **Rota:** `POST /api/expenses`
- **Caso de Uso:** `IRegisterExpenseUseCase`
- **Body:** `RequestExpenseJson`
- **Resposta Sucesso (`201`):** `ResponseRegisteredExpenseJson`

### 2. Listar Todas as Despesas
- **Rota:** `GET /api/expenses`
- **Caso de Uso:** `IGetAllExpenseUseCase`
- **Resposta Sucesso (`200`):** `ResponseExpensesJson` (retorna `204 No Content` se a lista estiver vazia).

### 3. Obter Despesa por ID
- **Rota:** `GET /api/expenses/{id}`
- **Caso de Uso:** `IGetExpenseByIdUseCase`
- **Resposta Sucesso (`200`):** `ResponseExpenseJson`

### 4. Atualizar Despesa
- **Rota:** `PUT /api/expenses/{id}`
- **Caso de Uso:** `IUpdateExpenseUseCase`
- **Body:** `RequestExpenseJson`
- **Resposta Sucesso (`204`):** *Sem conteúdo (No Content)*

### 5. Atualizar Estado da Despesa
- **Rota:** `PATCH /api/expenses/{id}/status`
- **Caso de Uso:** `IUpdateExpenseStatusUseCase`
- **Body:** `RequestExpenseStatusJson`
- **Resposta Sucesso (`204`):** *Sem conteúdo (No Content)*

### 6. Eliminar Despesa
- **Rota:** `DELETE /api/expenses/{id}`
- **Caso de Uso:** `IDeleteExpenseUseCase`
- **Resposta Sucesso (`204`):** *Sem conteúdo (No Content)*

---

## ⚡ Tratamento de Erros

A API retorna mensagens padronizadas utilizando o modelo `ResponseErrorJson` quando ocorrem erros de validação (`400 Bad Request`) ou registos não encontrados (`404 Not Found`).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [.NET SDK 8.0](https://dotnet.microsoft.com/download) ou superior instalado.

