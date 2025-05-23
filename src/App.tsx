// src/App.tsx
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { PWABadge } from "./PWABadge";
import { useToast } from "./components/ToastContainer";
import { Budget, Transaction } from "./utils/types";
import { Dashboard } from "./components/Dashboard";
import { TransactionForm } from "./components/TransactionForm";
import { TransactionList } from "./components/TransactionList";
import { BudgetsPage } from "./pages/BudgetsPage";

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem("transactions");
    return savedTransactions ? JSON.parse(savedTransactions) : [];
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const savedBudgets = localStorage.getItem("budgets");
    return savedBudgets ? JSON.parse(savedBudgets) : [];
  });

  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [budgets]);

  const addTransaction = (transaction: Transaction) => {
    setTransactions((prevTransactions) => [
      { ...transaction, id: crypto.randomUUID() },
      ...prevTransactions,
    ]);
    const message =
      transaction.type === "income" ? "Przychód dodany!" : "Wydatek dodany!";
    const type = transaction.type === "income" ? "success" : "info";
    addToast(
      `${message} ${transaction.amount.toFixed(2)} PLN w kategorii ${
        transaction.category
      }.`,
      type
    );
  };

  const saveBudget = (newOrUpdatedBudget: Budget) => {
    setBudgets((prevBudgets) => {
      const existingIndex = prevBudgets.findIndex(
        (b) => b.id === newOrUpdatedBudget.id
      );
      if (existingIndex > -1) {
        return prevBudgets.map((b) =>
          b.id === newOrUpdatedBudget.id ? newOrUpdatedBudget : b
        );
      } else {
        return [...prevBudgets, newOrUpdatedBudget];
      }
    });
    addToast(
      `Budżet dla "${newOrUpdatedBudget.category}" zapisany!`,
      "success"
    );
  };

  const deleteBudget = (id: string) => {
    setBudgets((prevBudgets) =>
      prevBudgets.filter((budget) => budget.id !== id)
    );
    addToast("Budżet usunięty.", "info");
  };

  const calculateBalance = () => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return totalIncome - totalExpense;
  };

  return (
    <Router>
      <div className="h-screen w-screen flex flex-col items-center justify-start p-8 bg-gray-900 text-white font-sans overflow-auto antialiased">
        <nav className="w-full max-w-4xl bg-gray-800 p-4 rounded-lg shadow-lg mb-8">
          <ul className="flex justify-around text-lg font-semibold">
            <li>
              <Link
                to="/"
                className="text-blue-400 hover:text-blue-200 transition-colors duration-200"
              >
                Panel Główny
              </Link>
            </li>
            <li>
              <Link
                to="/add"
                className="text-blue-400 hover:text-blue-200 transition-colors duration-200"
              >
                Dodaj Transakcję
              </Link>
            </li>
            <li>
              <Link
                to="/list"
                className="text-blue-400 hover:text-blue-200 transition-colors duration-200"
              >
                Transakcje
              </Link>
            </li>
            <li>
              <Link
                to="/budgets"
                className="text-blue-400 hover:text-blue-200 transition-colors duration-200"
              >
                Budżety
              </Link>
            </li>
          </ul>
        </nav>
        <main className="flex-1 w-full max-w-4xl">
          <Routes>
            <Route
              path="/"
              element={
                <Dashboard transactions={transactions} budgets={budgets} />
              }
            />
            <Route
              path="/add"
              element={<TransactionForm onAddTransaction={addTransaction} />}
            />
            <Route
              path="/list"
              element={<TransactionList transactions={transactions} />}
            />
            <Route
              path="/budgets/*"
              element={
                <BudgetsPage
                  budgets={budgets}
                  transactions={transactions}
                  onSaveBudget={saveBudget}
                  onDeleteBudget={deleteBudget}
                />
              }
            />
            <Route
              path="*"
              element={
                <h2 className="text-red-500 text-3xl text-center">
                  Strona nie znaleziona!
                </h2>
              }
            />
          </Routes>
        </main>
        <footer className="mt-8 text-sm text-gray-500">
          Twoje Finanse v1.0 | Bilans:{" "}
          <span
            className={
              calculateBalance() >= 0 ? "text-green-400" : "text-red-400"
            }
          >
            {calculateBalance().toFixed(2)} PLN
          </span>
        </footer>
        <PWABadge />
      </div>
    </Router>
  );
}
