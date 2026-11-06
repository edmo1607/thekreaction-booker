import { cn } from "../lib/utils";
import type { LeadStatus } from "../types";

const styles: Record<LeadStatus, string> = {
  "New Lead": "border-blue-400/25 bg-blue-400/10 text-blue-200",
  Waiting: "border-amber-300/25 bg-amber-300/10 text-amber-100",
  "Proposal Sent": "border-violet-300/25 bg-violet-300/10 text-violet-100",
  Booked: "border-studio-accent/35 bg-studio-accent/15 text-red-100",
  Closed: "border-zinc-500/25 bg-zinc-500/10 text-zinc-300",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", styles[status])}>{status}</span>;
}
