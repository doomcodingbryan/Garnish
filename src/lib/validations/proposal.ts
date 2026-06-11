import { z } from "zod";

export const ProposalSchema = z.object({
  meal_description: z.string().max(600).optional(),
  deliverables: z.string().min(1).max(400),
  posting_window_days: z.coerce.number().int().min(1).max(365),
  payment_dollars: z.coerce.number().min(0),
  message: z.string().max(500).optional(),
});

export const CounterSchema = ProposalSchema;

export type ProposalInput = z.infer<typeof ProposalSchema>;
export type CounterInput = z.infer<typeof CounterSchema>;
