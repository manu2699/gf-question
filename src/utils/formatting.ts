import type { User } from "@/types";

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString();
}

export const formatCurrency = (amount: number, currency: string = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount);
};

export const formatName = (user: User) => {
  return { ...user, fullName: `${user.firstName} ${user.lastName}` };
};
