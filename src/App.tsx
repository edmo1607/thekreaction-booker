import { useMemo, useState } from "react";
import { Bot, CalendarDays, CreditCard, Instagram, MessageCircle, Sparkles } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { LeadIntakeForm } from "./components/LeadIntakeForm";
import { LeadsTable } from "./components/LeadsTable";
import { ProposalGenerator } from "./components/ProposalGenerator";
import { QuickReplies } from "./components/QuickReplies";
import { ServicesManager } from "./components/ServicesManager";
import { Button } from "./components/ui/Button";
import { Card, CardContent } from "./components/ui/Card";
import { leadsSeed, servicesSeed } from "./data/seed";
import { calculateProposal, getLiveRecordingGuide, isLiveRecordingService, recommendService, usesShowPackagePricing } from "./lib/proposal";
import type { Lead, LiveRecordingDetails, Service } from "./types";

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

const initialLead: Lead = {
  id: "draft-lead",
  clientName: "New Instagram Client",
  instagram: "@clienthandle",
  contact: "",
  serviceRequested: "Event Recap Videos",
  eventDate: "",
  location: "Miami, FL",
  hours: 3,
  budget: 0,
  notes: "Wants a modern event recap and reels for Instagram.",
  status: "New Lead",
};

function App() {
  const [leads, setLeads] = useState<Lead[]>(leadsSeed);
  const [services, setServices] = useState<Service[]>(servicesSeed);
  const [lead, setLead] = useState<Lead>(initialLead);
  const recommended = useMemo(() => recommendService(lead, services), [lead, services]);
  const [selectedServiceId, setSelectedServiceId] = useState(recommended.id);
  const service = services.find((item) => item.id === selectedServiceId) ?? recommended;
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const showPackageLead = usesShowPackagePricing(lead);
  const liveRecording = isLiveRecordingService(lead);
  const liveRecordingGuide = getLiveRecordingGuide(lead);

  const addOns = useMemo(
    () => service.addOns.filter((addOn) => selectedAddOns.includes(addOn.id)),
    [service, selectedAddOns],
  );
  const proposal = useMemo(() => calculateProposal(lead, service, addOns), [lead, service, addOns]);

  const updateLead = (updatedLead: Lead) => {
    if (updatedLead.serviceRequested !== lead.serviceRequested) {
      const matchingService = services.find((serviceItem) => serviceItem.name === updatedLead.serviceRequested);
      if (matchingService) {
        setSelectedServiceId(matchingService.id);
        setSelectedAddOns([]);
      }

      if (updatedLead.serviceRequested === "Live Recording") {
        setLead({
          ...updatedLead,
          hours: 1,
          liveRecordingDetails: updatedLead.liveRecordingDetails ?? defaultLiveRecordingDetails,
        });
        return;
      }
    }

    setLead(updatedLead);
  };

  const saveLead = () => {
    const savedLead = { ...lead, id: crypto.randomUUID() };
    setLeads((current) => [savedLead, ...current]);
    setLead({ ...initialLead, id: "draft-lead", clientName: "", instagram: "", contact: "", notes: "", budget: 0 });
  };

  const updateService = (updated: Service) => {
    setServices((current) => current.map((serviceItem) => (serviceItem.id === updated.id ? updated : serviceItem)));
  };

  const addService = () => {
    const newService: Service = {
      id: crypto.randomUUID(),
      name: "New Service",
      basePrice: 750,
      description: "Describe the service offer and client outcome.",
      deliverables: ["Primary deliverable", "Social-ready export"],
      addOns: [{ id: crypto.randomUUID(), name: "Premium add-on", price: 250 }],
      turnaround: "7 business days",
    };
    setServices((current) => [...current, newService]);
    setSelectedServiceId(newService.id);
    setSelectedAddOns([]);
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOns((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const deleteLead = (id: string) => {
    const nextLeads = leads.filter((leadItem) => leadItem.id !== id);
    setLeads(nextLeads);

    if (lead.id === id) {
      setLead(nextLeads[0] ?? { ...initialLead, id: "draft-lead", clientName: "", instagram: "", contact: "", notes: "", budget: 0 });
      setSelectedAddOns([]);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8">
        <header className="relative overflow-hidden rounded-lg border border-studio-line bg-black/50 p-5 shadow-line shadow-red lg:flex lg:items-center lg:justify-between">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,rgba(209,0,0,.18),transparent_40%,rgba(255,255,255,.035))]" />
          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <div className="print-logo-panel flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-studio-accent/40 bg-black shadow-red sm:h-20 sm:w-20">
                <img src="/brand/the-k-reaction-mark.jpeg" alt="The K Reaction logo" className="brand-logo h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-normal text-studio-accent">The K Reaction</p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">AI Lead Studio</h1>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-studio-muted">
              Internal intake, package recommendation, proposal generation, and Instagram DM response workspace for audiovisual clients.
            </p>
          </div>
          <div className="relative grid grid-cols-2 gap-2 sm:flex">
            <Button variant="secondary">
              <Instagram className="h-4 w-4" />
              Instagram
            </Button>
            <Button variant="secondary">
              <CalendarDays className="h-4 w-4" />
              Calendly
            </Button>
            <Button variant="primary">
              <CreditCard className="h-4 w-4" />
              Stripe
            </Button>
          </div>
        </header>

        <Dashboard leads={leads} />

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(420px,.95fr)]">
          <div className="grid gap-6">
            <LeadIntakeForm lead={lead} services={services} onLeadChange={updateLead} onSaveLead={saveLead} />
            <QuickReplies lead={lead} service={service} proposal={proposal} />
          </div>
          <div className="grid gap-6">
            <Card>
              <CardContent className="grid gap-4 sm:grid-cols-3">
                {[
                  { icon: Bot, label: "Package match", value: showPackageLead ? `${proposal.packageName} package` : recommended.name },
                  { icon: Sparkles, label: "Recommended upsell", value: service.addOns[0]?.name ?? "Custom add-on" },
                  {
                    icon: MessageCircle,
                    label: "DM next step",
                    value: lead.status === "New Lead" ? (showPackageLead ? "Ask performance details" : "Ask details") : "Follow up",
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="rounded-lg border border-studio-line bg-white/[0.035] p-4">
                      <Icon className="h-4 w-4 text-studio-accent" />
                      <p className="mt-3 text-xs uppercase tracking-normal text-studio-muted">{item.label}</p>
                      <p className="mt-1 text-sm font-medium">{item.value}</p>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {liveRecording && (
              <Card>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <p className="text-xs uppercase tracking-normal text-studio-accent">Internal AI Guide</p>
                    <h2 className="mt-1 text-lg font-semibold">Live Recording Strategy</h2>
                    <p className="mt-1 text-sm text-studio-muted">Internal guidance only. This does not appear in client proposals, DM replies, or PDFs.</p>
                  </div>
                  {[
                    ["Suggested package", liveRecordingGuide.suggestedPackage],
                    ["Suggested Market Price", liveRecordingGuide.suggestedMarketRate],
                    ["Production complexity", liveRecordingGuide.productionComplexity],
                    ["Recommended camera setup", liveRecordingGuide.recommendedCameraSetup],
                    ["Suggested upsells", liveRecordingGuide.suggestedUpsells],
                    ["Audio recommendations", liveRecordingGuide.audioRecommendations],
                    ["Risk notes", liveRecordingGuide.riskNotes],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-studio-line bg-white/[0.035] p-3">
                      <p className="text-xs font-medium uppercase tracking-normal text-studio-muted">{label}</p>
                      <p className="mt-2 text-sm leading-6 text-white">{value}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <ProposalGenerator
              lead={lead}
              service={service}
              proposal={proposal}
              selectedAddOns={selectedAddOns}
              onToggleAddOn={toggleAddOn}
            />
          </div>
        </section>

        <ServicesManager
          services={services}
          selectedServiceId={selectedServiceId}
          onSelectService={(id) => {
            setSelectedServiceId(id);
            setSelectedAddOns([]);
          }}
          onUpdateService={updateService}
          onAddService={addService}
        />

        <LeadsTable leads={leads} onDeleteLead={deleteLead} />
      </div>
    </main>
  );
}

export default App;
