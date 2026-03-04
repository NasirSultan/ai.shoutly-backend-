export enum Plan {
  STARTER = "STARTER",
  GROWTH = "GROWTH",
}

export enum Billing {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export const PlanPrices: Record<Plan, Record<Billing, number>> = {
  [Plan.STARTER]: {
    [Billing.MONTHLY]: 11,
    [Billing.YEARLY]: 100,
  },
  [Plan.GROWTH]: {
    [Billing.MONTHLY]: 18,
    [Billing.YEARLY]: 170,
  },
};