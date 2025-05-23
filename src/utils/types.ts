export interface Transaction {
  _id: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  date: string;
  description: string;
  createdAt?: string;
}

export interface Budget {
  _id: string;
  category: string;
  limit: number;
  month: string;
  createdAt?: string;
}
