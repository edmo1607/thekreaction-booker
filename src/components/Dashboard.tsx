import { CalendarCheck, CircleDollarSign, ClipboardList, Send } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { formatCurrency } from "../lib/utils";
import type { Lead, Proposal } from "../types";

type DashboardProps = {
  leads: Lead[];
  currentProposal: Proposal;
};

export function Dashboard({ leads, currentProposal }: DashboardProps) {
  const pending = leads.filter((lead) => lead.status === "Waiting" || lead.status === "New Lead").length;
  const booked = leads.filter((lead) => lead.status === "Booked").length;
  const projected = leads.reduce((sum, lead) => sum + (lead.status === "Closed" ? 0 : lead.budget || 0), 0) + currentProposal.price;

  const metrics = [
    { label: "Total inquiries", value: leads.length + 1, icon: ClipboardList },
    { label: "Pending proposals", value: pending + 1, icon: Send },
    { label: "Booked projects", value: booked, icon: CalendarCheck },
    { label: "Revenue estimate", value: formatCurrency(projected), icon: CircleDollarSign },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="text-sm text-studio-muted">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-studio-line bg-white/[0.05]">
                <Icon className="h-5 w-5 text-studio-accent" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
