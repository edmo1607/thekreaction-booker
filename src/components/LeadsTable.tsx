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
    if (window.confirm("Are you sure you want to delete this lead?")) {
      onDeleteLead(lead.id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Lead Pipeline</h2>
        <p className="mt-1 text-sm text-studio-muted">Current inquiries and booking status.</p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
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
                  <td className="py-4 text-zinc-300">{lead.eventDate}</td>
                  <td className="py-4 text-zinc-300">{lead.location}</td>
                  <td className="py-4 text-zinc-300">{formatCurrency(lead.budget)}</td>
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
