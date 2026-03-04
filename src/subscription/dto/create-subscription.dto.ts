import { Plan, Billing } from "../subscription.constants";

export class CreateSubscriptionDto {
  plan: Plan;
  billing: Billing;
}