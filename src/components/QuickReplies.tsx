import { CheckCircle2, Copy, MessageSquareText, Send } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { isPerformanceLead, usesShowPackagePricing } from "../lib/proposal";
import { copyText, formatCurrency } from "../lib/utils";
import type { Lead, Proposal, Service } from "../types";

type QuickRepliesProps = {
  lead: Lead;
  service: Service;
  proposal: Proposal;
};

export function QuickReplies({ lead, service, proposal }: QuickRepliesProps) {
  const performanceLead = isPerformanceLead(lead);
  const showPackageLead = usesShowPackagePricing(lead);
  const detailRequest = performanceLead
    ? `Hi Andrew! Thanks for reaching out 🙌

We’d love to help capture your live performance on May 28th.

Based on your message, our live performance / event coverage packages would likely be the best fit for this project.

To recommend the right setup and send accurate pricing, could you share:

• Venue/location
• Performance time
• Total performance duration
• Whether you’d like only the live performance recorded or also short promo clips/reels for social media

Once we have those details, we can send over the best package option and availability.`
    : `Hey ${lead.clientName || "there"}! Thanks for reaching out to The K Reaction. To quote this properly, can you send the event date, location, service needed, hours needed, and your ideal budget?`;

  const replies = [
    {
      label: performanceLead ? "Ask performance details" : "Ask for details",
      icon: MessageSquareText,
      text: detailRequest,
    },
    {
      label: "Send pricing",
      icon: Send,
      text: showPackageLead
        ? `Based on a ${proposal.showDurationLabel} show, we recommend the ${proposal.packageName} package at ${formatCurrency(proposal.basePackagePrice)}. Final total with selected add-ons is ${formatCurrency(proposal.price)}, with a ${formatCurrency(proposal.deposit)} deposit to book the date.`
        : `For ${service.name}, pricing starts at ${formatCurrency(service.basePrice)}. Based on your details, I’d estimate ${formatCurrency(proposal.price)} with a ${formatCurrency(proposal.deposit)} deposit to book the date.`,
    },
    {
      label: "Follow-up",
      icon: Copy,
      text: `Hey ${lead.clientName || "there"}, just checking in on the proposal. If the date is still open on your side, we can lock it in with the deposit and I’ll send the booking confirmation.`,
    },
    {
      label: "Booking confirmation",
      icon: CheckCircle2,
      text: `Perfect, you’re booked with The K Reaction. Next step is the ${formatCurrency(proposal.deposit)} deposit. Once that’s sent, we’ll confirm timing, location, main contact, and creative priorities for the shoot.`,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold">Instagram DM Quick Replies</h2>
        <p className="mt-1 text-sm text-studio-muted">Copy professional replies without slowing down the conversation.</p>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {replies.map((reply) => {
          const Icon = reply.icon;
          return (
            <div key={reply.label} className="rounded-lg border border-studio-line bg-black/25 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Icon className="h-4 w-4 text-studio-accent" />
                  {reply.label}
                </div>
                <Button size="icon" variant="ghost" onClick={() => copyText(reply.text)} title={`Copy ${reply.label}`}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-3 line-clamp-5 text-sm leading-6 text-studio-muted">{reply.text}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
