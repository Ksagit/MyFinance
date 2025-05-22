import { Routes, Route, useParams } from "react-router-dom";
import { BudgetList } from "../components/BudgetList";
import { BudgetForm } from "../components/BudgetForm";
import { Budget, Transaction } from "../utils/types";

export const BudgetsPage = ({
  budgets,
  transactions,
  onSaveBudget,
  onDeleteBudget,
}: {
  budgets: Budget[];
  transactions: Transaction[];
  onSaveBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}) => {
  const { id } = useParams();
  const existingBudget = id ? budgets.find((b) => b.id === id) : undefined;

  return (
    <div className="w-full max-w-4xl">
      <Routes>
        <Route
          index
          element={
            <BudgetList
              budgets={budgets}
              transactions={transactions}
              onDeleteBudget={onDeleteBudget}
            />
          }
        />
        <Route
          path="new"
          element={<BudgetForm onSaveBudget={onSaveBudget} />}
        />
        <Route
          path="edit/:id"
          element={
            <BudgetForm
              onSaveBudget={onSaveBudget}
              existingBudget={existingBudget}
            />
          }
        />
      </Routes>
    </div>
  );
};
