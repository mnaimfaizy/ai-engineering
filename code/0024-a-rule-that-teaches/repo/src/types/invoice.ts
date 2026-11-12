export type Invoice = {
  id: string;
  plan: "annual" | "monthly";
  price: number;
  monthsLeft: number;
};
