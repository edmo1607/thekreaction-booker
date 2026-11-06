import { Plus, Save } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { Field, Input, Select, Textarea } from "./ui/Field";
import { isLiveRecordingService, usesShowPackagePricing } from "../lib/proposal";
import type { Lead, LeadStatus, LiveRecordingDetails, Service } from "../types";

const statuses: LeadStatus[] = ["New Lead", "Waiting", "Proposal Sent", "Booked", "Closed"];
const defaultLiveRecordingDetails: LiveRecordingDetails = {
  performanceLocation: "",
  performanceDate: "",
  callTime: "",
  performanceStartTime: "",
  totalPerformanceDuration: 60,
  numberOfPerformers: 1,
  audioBoardAccess: true,
  needPromoReels: true,
  multiCameraSetup: false,
  notes: "",
};

type LeadIntakeFormProps = {
  lead: Lead;
  services: Service[];
  onLeadChange: (lead: Lead) => void;
  onSaveLead: () => void;
};

export function LeadIntakeForm({ lead, services, onLeadChange, onSaveLead }: LeadIntakeFormProps) {
  const update = <K extends keyof Lead>(key: K, value: Lead[K]) => onLeadChange({ ...lead, [key]: value });
  const showPackageLead = usesShowPackagePricing(lead);
  const liveRecording = isLiveRecordingService(lead);
  const liveDetails = lead.liveRecordingDetails ?? defaultLiveRecordingDetails;
  const updateLiveDetails = <K extends keyof LiveRecordingDetails>(key: K, value: LiveRecordingDetails[K]) => {
    const nextDetails = { ...liveDetails, [key]: value };
    onLeadChange({
      ...lead,
      ...(key === "performanceLocation" ? { location: String(value) } : {}),
      ...(key === "performanceDate" ? { eventDate: String(value) } : {}),
      ...(key === "totalPerformanceDuration" ? { hours: Number(value) / 60 } : {}),
      liveRecordingDetails: nextDetails,
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Lead Intake</h2>
          <p className="mt-1 text-sm text-studio-muted">Capture the DM details needed to quote fast.</p>
        </div>
        <Button variant="primary" onClick={onSaveLead}>
          <Save className="h-4 w-4" />
          Save Lead
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Client name">
            <Input value={lead.clientName} onChange={(event) => update("clientName", event.target.value)} />
          </Field>
          <Field label="Instagram handle">
            <Input value={lead.instagram} onChange={(event) => update("instagram", event.target.value)} />
          </Field>
          <Field label="Phone / email">
            <Input value={lead.contact} onChange={(event) => update("contact", event.target.value)} />
          </Field>
          <Field label="Service requested">
            <Select value={lead.serviceRequested} onChange={(event) => update("serviceRequested", event.target.value)}>
              {services.map((service) => (
                <option key={service.id} value={service.name}>
                  {service.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Event date">
            <Input type="date" value={lead.eventDate} onChange={(event) => update("eventDate", event.target.value)} />
          </Field>
          <Field label="Location">
            <Input value={lead.location} onChange={(event) => update("location", event.target.value)} />
          </Field>
          <Field label={showPackageLead ? "How long the show will be" : "Hours needed"}>
            <Input type="number" min={1} value={lead.hours} onChange={(event) => update("hours", Number(event.target.value))} />
          </Field>
          <Field label="Budget">
            <Input type="number" min={0} inputMode="numeric" placeholder="Not shared yet" value={lead.budget || ""} onChange={(event) => update("budget", Number(event.target.value) || 0)} />
          </Field>
          <Field label="Client status">
            <Select value={lead.status} onChange={(event) => update("status", event.target.value as LeadStatus)}>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </Select>
          </Field>
          <div className="hidden md:block" />
          <Field label="Notes">
            <Textarea value={lead.notes} onChange={(event) => update("notes", event.target.value)} />
          </Field>
          <div className="rounded-lg border border-dashed border-studio-line bg-white/[0.03] p-4 text-sm text-studio-muted">
            <Plus className="mb-3 h-5 w-5 text-studio-accent" />
            {showPackageLead
              ? "For event recap, live performance, stage show, DJ set, concert, and event coverage leads, how long the show will be drives the package recommendation and pricing."
              : "Future integrations can enrich this intake from Instagram, WhatsApp, Calendly, Stripe, and CRM records without changing the form model."}
          </div>
        </div>
        {liveRecording && (
          <div className="mt-5 overflow-hidden rounded-lg border border-studio-accent/35 bg-black/30 shadow-red transition-all duration-200">
            <div className="border-b border-studio-line bg-studio-accent/10 p-4">
              <h3 className="text-base font-semibold">Live Recording Details</h3>
              <p className="mt-1 text-sm text-studio-muted">Internal intake for performance recording logistics and setup recommendations.</p>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2">
              <Field label="Performance location">
                <Input value={liveDetails.performanceLocation} onChange={(event) => updateLiveDetails("performanceLocation", event.target.value)} />
              </Field>
              <Field label="Performance date">
                <Input type="date" value={liveDetails.performanceDate} onChange={(event) => updateLiveDetails("performanceDate", event.target.value)} />
              </Field>
              <Field label="Call time">
                <Input type="time" value={liveDetails.callTime} onChange={(event) => updateLiveDetails("callTime", event.target.value)} />
              </Field>
              <Field label="Performance start time">
                <Input type="time" value={liveDetails.performanceStartTime} onChange={(event) => updateLiveDetails("performanceStartTime", event.target.value)} />
              </Field>
              <Field label="Total performance duration">
                <Input
                  type="number"
                  min={1}
                  value={liveDetails.totalPerformanceDuration}
                  onChange={(event) => updateLiveDetails("totalPerformanceDuration", Number(event.target.value))}
                />
              </Field>
              <Field label="Number of performers">
                <Input
                  type="number"
                  min={1}
                  value={liveDetails.numberOfPerformers}
                  onChange={(event) => updateLiveDetails("numberOfPerformers", Number(event.target.value))}
                />
              </Field>
              <Field label="Audio board access?">
                <Select
                  value={liveDetails.audioBoardAccess ? "yes" : "no"}
                  onChange={(event) => updateLiveDetails("audioBoardAccess", event.target.value === "yes")}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
              <Field label="Need promo reels?">
                <Select
                  value={liveDetails.needPromoReels ? "yes" : "no"}
                  onChange={(event) => updateLiveDetails("needPromoReels", event.target.value === "yes")}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
              <Field label="Multi-camera setup?">
                <Select
                  value={liveDetails.multiCameraSetup ? "yes" : "no"}
                  onChange={(event) => updateLiveDetails("multiCameraSetup", event.target.value === "yes")}
                >
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Select>
              </Field>
              <div className="hidden md:block" />
              <div className="md:col-span-2">
                <Field label="Notes">
                  <Textarea value={liveDetails.notes} onChange={(event) => updateLiveDetails("notes", event.target.value)} />
                </Field>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
