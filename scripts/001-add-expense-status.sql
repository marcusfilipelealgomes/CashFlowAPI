-- Adiciona o status da despesa (0 = Paga, 1 = A vencer). Despesas existentes ficam como pagas.
IF COL_LENGTH('dbo.Expenses', 'Status') IS NULL
BEGIN
    ALTER TABLE dbo.Expenses
        ADD Status INT NOT NULL
        CONSTRAINT DF_Expenses_Status DEFAULT (0);
END
