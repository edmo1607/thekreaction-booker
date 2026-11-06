import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./ui/Button";
import { formatCurrency } from "../lib/utils";
import type { Lead } from "../types";

type LeadsTableProps = {
  leads: Lead[];
  onDeleteLead: (id: string) => void;
};

export function LeadsTable({ leads, onDeleteLead }: LeadsTableProps) {
  const confirmDelete = (lead: Lead) => {
    if (window.confirm(`Delete ${lead.clientName}? This can't be undone.`)) {
      onDeleteLead(lead.id);
    }
  };

  const budgetLabel = (lead: Lead) => (lead.budget ? formatCurrency(lead.budget) : "—");
  const dateLabel = (lead: Lead) =>
    lead.eventDate
      ? new Date(`${lead.eventDate}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Date TBD";

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Lead Pipeline</h2>
        <p className="mt-1 text-sm text-studio-muted">Current inquiries and booking status.</p>
      </CardHeader>
      <CardContent>
        {leads.length === 0 && <p className="text-sm text-studio-muted">No leads yet. Save one from Lead Intake.</p>}
        <ul className="grid gap-3 md:hidden">
          {leads.map((lead) => (
            <li key={lead.id} className="rounded-lg border border-studio-line bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{lead.clientName}</p>
                  <p className="truncate text-sm text-studio-muted">{lead.instagram}</p>
                </div>
                <StatusBadge status={lead.status} />
              </div>
              <p className="mt-3 text-sm text-zinc-300">{lead.serviceRequested}</p>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-studio-muted">
                <span>{dateLabel(lead)}</span>
                <span>{lead.location}</span>
                <span>Budget {budgetLabel(lead)}</span>
              </div>
              <div className="mt-3 flex justify-end border-t border-studio-line pt-2">
                <Button size="icon" variant="ghost" onClick={() => confirmDelete(lead)} title={`Delete ${lead.clientName}`} aria-label={`Delete ${lead.clientName}`}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-studio-muted">
              <tr className="border-b border-studio-line">
                <th className="pb-3 font-medium">Client</th>
                <th className="pb-3 font-medium">Service</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Location</th>
                <th className="pb-3 font-medium">Budget</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-studio-line/70 last:border-0">
                  <td className="py-4">
                    <p className="font-medium">{lead.clientName}</p>
                    <p className="text-studio-muted">{lead.instagram}</p>
                  </td>
                  <td className="py-4 text-zinc-300">{lead.serviceRequested}</td>
                  <td className="py-4 text-zinc-300">{dateLabel(lead)}</td>
                  <td className="py-4 text-zinc-300">{lead.location}</td>
                  <td className="py-4 text-zinc-300">{budgetLabel(lead)}</td>
                  <td className="py-4"><StatusBadge status={lead.status} /></td>
                  <td className="py-4 text-right">
                    <Button size="icon" variant="ghost" onClick={() => confirmDelete(lead)} title={`Delete ${lead.clientName}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
