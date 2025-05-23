// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

import { useToast } from "./components/ToastContainer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"; // Importuj
import { Dashboard } from "./components/Dashboard";
import { PWABadge } from "./components/PWABadge";
import { BudgetsPage } from "./pages/BudgetsPage";
import { Transaction, Budget } from "./utils/types";
import { TransactionList } from "./components/TransactionList";
import { TransactionForm } from "./components/TransactionForm";

const API_URL = "http://localhost:5001/api";

export default function App() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: transactions = [],
    isLoading: isLoadingTransactions,
    error: transactionsError,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/transactions`);
      if (!response.ok) throw new Error("Failed to fetch transactions");
      return response.json();
    },
  });

  const {
    data: budgets = [],
    isLoading: isLoadingBudgets,
    error: budgetsError,
  } = useQuery<Budget[]>({
    queryKey: ["budgets"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/budgets`);
      if (!response.ok) throw new Error("Failed to fetch budgets");
      return response.json();
    },
  });

  if (transactionsError || budgetsError) {
    addToast(
      "Błąd ładowania danych: " +
        (transactionsError?.message || budgetsError?.message),
      "error",
      5000
    );
  }

  const addTransactionMutation = useMutation<
    Transaction,
    Error,
    Omit<Transaction, "id" | "_id" | "createdAt">
  >({
    mutationFn: async (transaction) => {
      const response = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });
      if (!response.ok) throw new Error("Failed to add transaction");
      return response.json();
    },
    onSuccess: (newTransaction) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      const message =
        newTransaction.type === "income"
          ? "Przychód dodany!"
          : "Wydatek dodany!";
      const type = newTransaction.type === "income" ? "success" : "info";
      addToast(
        `${message} ${newTransaction.amount.toFixed(2)} PLN w kategorii ${
          newTransaction.category
        }.`,
        type
      );
    },
    onError: (error) => {
      addToast("Błąd dodawania transakcji: " + error.message, "error");
    },
  });

  const saveBudgetMutation = useMutation<Budget, Error, Budget>({
    mutationFn: async (budget) => {
      const method = budget._id && budget._id.length === 24 ? "PUT" : "POST";
      const url =
        method === "PUT"
          ? `${API_URL}/budgets/${budget._id}`
          : `${API_URL}/budgets`;
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(budget),
      });
      if (!response.ok) throw new Error("Failed to save budget");
      return response.json();
    },
    onSuccess: (savedBudget) => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      addToast(`Budżet dla "${savedBudget.category}" zapisany!`, "success");
    },
    onError: (error) => {
      addToast("Błąd zapisywania budżetu: " + error.message, "error");
    },
  });

  const deleteBudgetMutation = useMutation<unknown, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`${API_URL}/budgets/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete budget");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] }); // Unieważnij budżety
      addToast("Budżet usunięty.", "info");
    },
    onError: (error) => {
      addToast("Błąd usuwania budżetu: " + error.message, "error");
    },
  });

  if (isLoadingTransactions || isLoadingBudgets) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-900 text-white font-sans">
        <p className="text-2xl">Ładowanie danych...</p>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mt-4"></div>
      </div>
    );
  }

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
      <div className="h-screen w-screen flex flex-col items-center justify-start p-8 bg-gray-900 text-white font-sans overflow-auto">
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
              element={
                <TransactionForm
                  onAddTransaction={addTransactionMutation.mutate}
                />
              }
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
                  transactions={transactions} // Nadal przekazujemy transakcje do obliczeń w BudgetsPage/BudgetList
                  onSaveBudget={saveBudgetMutation.mutate}
                  onDeleteBudget={deleteBudgetMutation.mutate}
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
