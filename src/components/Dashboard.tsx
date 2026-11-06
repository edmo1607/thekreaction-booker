import { CalendarCheck, CircleDollarSign, ClipboardList, Send } from "lucide-react";
import { Card, CardContent } from "./ui/Card";
import { formatCurrency } from "../lib/utils";
import type { Lead } from "../types";

type DashboardProps = {
  leads: Lead[];
};

const openStatuses = new Set<Lead["status"]>(["New Lead", "Waiting", "Proposal Sent"]);

export function Dashboard({ leads }: DashboardProps) {
  const awaitingProposal = leads.filter((lead) => lead.status === "New Lead" || lead.status === "Waiting").length;
  const proposalsSent = leads.filter((lead) => lead.status === "Proposal Sent").length;
  const booked = leads.filter((lead) => lead.status === "Booked").length;
  const openPipeline = leads.reduce((sum, lead) => sum + (openStatuses.has(lead.status) ? lead.budget || 0 : 0), 0);

  const metrics = [
    { label: "Awaiting proposal", value: awaitingProposal, hint: `${leads.length} saved leads`, icon: ClipboardList },
    { label: "Proposals sent", value: proposalsSent, hint: "Waiting on client", icon: Send },
    { label: "Booked projects", value: booked, hint: "Deposit secured", icon: CalendarCheck },
    { label: "Open pipeline", value: formatCurrency(openPipeline), hint: "From client budgets", icon: CircleDollarSign },
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
                <p className="mt-1 text-xs text-studio-muted">{metric.hint}</p>
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
