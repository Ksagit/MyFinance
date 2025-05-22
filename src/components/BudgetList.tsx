import { Link } from "react-router-dom";
import { Budget, Transaction } from "../utils/types";

export const BudgetList = ({
  budgets,
  transactions,
  onDeleteBudget,
}: {
  budgets: Budget[];
  transactions: Transaction[];
  onDeleteBudget: (id: string) => void;
}) => {
  const getSpentAmount = (budget: Budget) => {
    return transactions
      .filter(
        (t) =>
          t.type === "expense" &&
          t.category === budget.category &&
          t.date.startsWith(budget.month)
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  if (budgets.length === 0) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-xl max-w-3xl mx-auto text-gray-800 text-center">
        <p className="text-lg">Brak zdefiniowanych budżetów.</p>
        <p className="text-sm text-gray-500 mt-2">
          <Link to="new" className="text-blue-600 hover:underline">
            Dodaj nowy budżet
          </Link>{" "}
          aby zacząć.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-xl max-w-3xl mx-auto text-gray-800">
      <h2 className="text-2xl font-bold mb-6 text-center">Moje Budżety</h2>
      <div className="flex justify-end mb-4">
        <Link
          to="new"
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          Dodaj Nowy Budżet
        </Link>
      </div>
      <div className="space-y-4">
        {budgets.map((budget) => {
          const spent = getSpentAmount(budget);
          const remaining = budget.limit - spent;
          const percentage = (spent / budget.limit) * 100;

          return (
            <div
              key={budget.id}
              className="bg-gray-50 p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-center"
            >
              <div className="flex-1 mb-2 sm:mb-0 sm:mr-4">
                <h3 className="text-xl font-semibold">
                  {budget.category} ({budget.month})
                </h3>
                <p className="text-sm text-gray-600">
                  Limit: {budget.limit.toFixed(2)} PLN
                </p>
                <p className="text-sm text-gray-600">
                  Wydano: {spent.toFixed(2)} PLN
                </p>
                <p
                  className={`text-sm font-medium ${
                    remaining >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  Pozostało: {remaining.toFixed(2)} PLN
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="h-2.5 rounded-full"
                    style={{
                      width: `${Math.min(100, percentage)}%`,
                      backgroundColor: percentage > 100 ? "red" : "green",
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {percentage.toFixed(0)}% wykorzystania
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`edit/${budget.id}`}
                  className="py-1 px-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 text-sm"
                >
                  Edytuj
                </Link>
                <button
                  onClick={() => onDeleteBudget(budget.id)}
                  className="py-1 px-3 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                >
                  Usuń
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
