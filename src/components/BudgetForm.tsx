import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Budget } from "../utils/types";

export const BudgetForm = ({
  onSaveBudget,
  existingBudget,
}: {
  onSaveBudget: (budget: Budget) => void;
  existingBudget?: Budget;
}) => {
  const [category, setCategory] = useState(existingBudget?.category || "");
  const [limit, setLimit] = useState(existingBudget?.limit || 0);
  const [month, setMonth] = useState(
    existingBudget?.month || new Date().toISOString().slice(0, 7)
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (existingBudget) {
      setCategory(existingBudget.category);
      setLimit(existingBudget.limit);
      setMonth(existingBudget.month);
    }
  }, [existingBudget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (category.trim() === "" || limit <= 0) {
      alert("Proszę wypełnić wszystkie pola poprawnie.");
      return;
    }

    // Jeśli istniejący budżet, to użyj jego _id, inaczej pozostaw undefined
    const budgetToSave: Budget = {
      _id: existingBudget?._id, // To _id będzie tylko dla aktualizacji PUT
      category: category.trim(),
      limit: parseFloat(limit.toFixed(2)),
      month,
    } as Budget; // Typowanie do Budget

    onSaveBudget(budgetToSave);
    navigate("/budgets");
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-md mx-auto text-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {existingBudget ? "Edytuj Budżet" : "Dodaj Nowy Budżet"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Kategoria:
          </label>
          <input
            type="text"
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="limit"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Limit:
          </label>
          <input
            type="number"
            id="limit"
            value={limit}
            onChange={(e) => setLimit(parseFloat(e.target.value))}
            required
            min="0.01"
            step="0.01"
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
          />
        </div>
        <div>
          <label
            htmlFor="month"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Miesiąc:
          </label>
          <input
            type="month"
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
        >
          {existingBudget ? "Zapisz Zmiany" : "Dodaj Budżet"}
        </button>
      </form>
    </div>
  );
};
