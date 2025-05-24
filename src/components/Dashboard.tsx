// src/components/Dashboard.tsx
import React, { useMemo, useState, useEffect } from "react"; // Dodano useState, useEffect
import { Link } from "react-router-dom";
import { Budget, Transaction } from "../utils/types";

interface DashboardProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, budgets }) => {
  // Stan dla danych użytkownika (przechowywanych w localStorage)
  const [userName, setUserName] = useState<string>(() => {
    // Odczytaj z localStorage przy inicjalizacji
    const savedName = localStorage.getItem("userName");
    return savedName || "";
  });
  const [userEmail, setUserEmail] = useState<string>(() => {
    const savedEmail = localStorage.getItem("userEmail");
    return savedEmail || "";
  });

  // Efekt do zapisywania danych użytkownika do localStorage
  useEffect(() => {
    localStorage.setItem("userName", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("userEmail", userEmail);
  }, [userEmail]);

  // Funkcja do pokazywania alertu (możesz użyć `useToast` tutaj, ale prosiłeś o `alert`)
  const showAlertWithUserData = () => {
    if (userName && userEmail) {
      alert(`Dane użytkownika:\nImię: ${userName}\nEmail: ${userEmail}`);
    } else {
      alert("Proszę najpierw uzupełnić dane użytkownika w formularzu!");
    }
  };

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

  const currentMonth = new Date().toISOString().slice(0, 7);
  const activeBudgets = useMemo(() => {
    return budgets
      .map((budget) => {
        const spent = transactions
          .filter(
            (t) =>
              t.type === "expense" &&
              t.category === budget.category &&
              t.date.startsWith(budget.month)
          )
          .reduce((sum, t) => sum + t.amount, 0);
        const remaining = budget.limit - spent;
        const percentage = (spent / budget.limit) * 100;
        return { ...budget, spent, remaining, percentage };
      })
      .filter((b) => b.month === currentMonth || b.remaining < 0);
  }, [budgets, transactions, currentMonth]);

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-3xl mx-auto text-gray-800 space-y-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Panel Główny</h2>

      {/* Sekcja Danych Użytkownika */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
        <h3 className="text-xl font-bold mb-4">Twoje Dane</h3>
        <div className="space-y-2">
          <div>
            <label
              htmlFor="userName"
              className="block text-sm font-medium text-gray-700"
            >
              Imię:
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Twoje imię"
            />
          </div>
          <div>
            <label
              htmlFor="userEmail"
              className="block text-sm font-medium text-gray-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="userEmail"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1.5 px-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              placeholder="Twój adres email"
            />
          </div>
          <button
            onClick={showAlertWithUserData}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200 mt-4"
          >
            Pokaż Moje Dane (Alert)
          </button>
        </div>
      </div>

      {/* Reszta Dashboardu (jak wcześniej) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mt-6">
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
            Największe wydatki według kategorii (Top 3)
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

      {activeBudgets.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">
            Aktywne Budżety ({currentMonth})
          </h3>
          <ul className="space-y-2">
            {activeBudgets.map((budget) => (
              <li
                key={budget._id}
                className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 p-3 rounded-md"
              >
                <div className="flex-1 text-sm sm:mr-4">
                  <span className="font-medium">{budget.category}:</span> Limit{" "}
                  {budget.limit.toFixed(2)} PLN
                </div>
                <div className="w-full sm:w-1/2 bg-gray-200 rounded-full h-2.5 mt-1 sm:mt-0">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(100, budget.percentage)}%`,
                      backgroundColor:
                        budget.percentage > 100 ? "red" : "green",
                    }}
                  ></div>
                </div>
                <span
                  className={`text-sm font-semibold ml-2 ${
                    budget.remaining >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {budget.spent.toFixed(2)} / {budget.limit.toFixed(2)} PLN
                </span>
                <Link
                  to="/budgets"
                  className="ml-2 text-blue-600 hover:underline text-sm"
                >
                  Szczegóły
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {transactions.length === 0 && budgets.length === 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>
            Dodaj swoje pierwsze transakcje lub budżety, aby zobaczyć
            podsumowanie!
          </p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
