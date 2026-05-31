export type Item = {
  id: string;
  title: string;
  description: string;
  city: string;
  category: string;
  wants: string;
  telegramUsername: string;
  imageUrl?: string;
  status: "available" | "reserved" | "traded";
  createdAt: string;
};
