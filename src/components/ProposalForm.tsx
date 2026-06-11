"use client";

import { useTransition, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ProposalInput } from "@/lib/validations/proposal";

const textareaClass =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none";

interface ProposalFormProps {
  action: (formData: FormData) => Promise<void>;
  initialValues?: Partial<ProposalInput>;
  submitLabel?: string;
}

export function ProposalForm({
  action,
  initialValues,
  submitLabel = "Send Proposal",
}: ProposalFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="meal_description">
          Meal / experience{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <textarea
          id="meal_description"
          name="meal_description"
          maxLength={600}
          defaultValue={initialValues?.meal_description ?? ""}
          placeholder="Describe what you're offering — tasting menu, brunch for two, etc."
          className={textareaClass}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="deliverables">
          Deliverables <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="deliverables"
          name="deliverables"
          required
          maxLength={400}
          defaultValue={initialValues?.deliverables ?? ""}
          placeholder="e.g. 1 Instagram Reel + 3 Stories, 1 TikTok video (60s), tagged posts"
          className={textareaClass}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="posting_window_days">Posting window (days)</Label>
          <Input
            id="posting_window_days"
            name="posting_window_days"
            type="number"
            min="1"
            max="365"
            required
            defaultValue={initialValues?.posting_window_days ?? 14}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="payment_dollars">Payment ($)</Label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="payment_dollars"
              name="payment_dollars"
              type="number"
              min="0"
              step="0.01"
              required
              defaultValue={initialValues?.payment_dollars ?? 0}
              className="h-9 pl-6"
            />
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">
          Message{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <textarea
          id="message"
          name="message"
          maxLength={500}
          defaultValue={initialValues?.message ?? ""}
          placeholder="Add a personal note..."
          className={`${textareaClass} min-h-[60px]`}
        />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Sending…" : submitLabel}
      </Button>
    </form>
  );
}
