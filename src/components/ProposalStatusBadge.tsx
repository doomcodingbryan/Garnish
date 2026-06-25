import { Clock, ArrowLeftRight, Check, X, Minus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ProposalStatus } from "@/types/database";
import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";

type Variant = ComponentProps<typeof Badge>["variant"];

const STATUS_CONFIG: Record<
  ProposalStatus,
  { label: string; variant: Variant; icon: LucideIcon }
> = {
  pending: { label: "Pending", variant: "warning", icon: Clock },
  countered: { label: "Countered", variant: "brand", icon: ArrowLeftRight },
  accepted: { label: "Accepted", variant: "success", icon: Check },
  declined: { label: "Declined", variant: "destructive", icon: X },
  withdrawn: { label: "Withdrawn", variant: "outline", icon: Minus },
};

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const { label, variant, icon: Icon } = STATUS_CONFIG[status];
  return (
    <Badge variant={variant}>
      <Icon />
      {label}
    </Badge>
  );
}
