import { useMemo } from "react";
import { Transaction } from "../utils/types";

export const Dashboard = ({
  transactions,
}: {
  transactions: Transaction[];
}) => {
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    const bal = income - expense;
    return { totalIncome: income, totalExpense: expense, balance: bal };
  }, [transactions]);

  const topExpenses = useMemo(() => {
    const expenseCategories: { [key: string]: number } = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        expenseCategories[t.category] =
          (expenseCategories[t.category] || 0) + t.amount;
      });

    return Object.entries(expenseCategories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
  }, [transactions]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-3xl mx-auto text-gray-800 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Panel Główny</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-blue-600">
            Całkowity Przychód
          </p>
          <p className="text-2xl font-bold text-blue-800">
            {totalIncome.toFixed(2)} PLN
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg shadow">
          <p className="text-sm font-medium text-red-600">Całkowity Wydatek</p>
          <p className="text-2xl font-bold text-red-800">
            {totalExpense.toFixed(2)} PLN
          </p>
        </div>
        <div
          className={`p-4 rounded-lg shadow ${
            balance >= 0 ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <p className="text-sm font-medium">Bilans</p>
          <p
            className={`text-2xl font-bold ${
              balance >= 0 ? "text-green-800" : "text-red-800"
            }`}
          >
            {balance.toFixed(2)} PLN
          </p>
        </div>
      </div>

      {transactions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">
            Największe wydatki według kategorii
          </h3>
          {topExpenses.length > 0 ? (
            <ul className="space-y-2">
              {topExpenses.map(([category, amount]) => (
                <li
                  key={category}
                  className="flex justify-between items-center bg-gray-50 p-3 rounded-md"
                >
                  <span className="font-medium">{category}</span>
                  <span className="text-lg font-semibold text-red-600">
                    {amount.toFixed(2)} PLN
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">Brak danych o wydatkach.</p>
          )}
        </div>
      )}

      {transactions.length === 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>Dodaj swoje pierwsze transakcje, aby zobaczyć podsumowanie!</p>
        </div>
      )}
    </div>
  );
};
