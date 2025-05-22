export interface Transaction {
  id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string;
}
