import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Copy, FileDown, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { usesShowPackagePricing } from "../lib/proposal";
import { copyText, formatCurrency } from "../lib/utils";
import type { AddOn, Lead, Proposal, Service } from "../types";

type ProposalGeneratorProps = {
  lead: Lead;
  service: Service;
  proposal: Proposal;
  selectedAddOns: string[];
  onToggleAddOn: (id: string) => void;
};

type EditableProposal = {
  title: string;
  intro: string;
  packageName: string;
  packagePrice: string;
  showDurationInPdf: boolean;
  showDurationLabel: string;
  reels: string;
  reelDuration: string;
  additionalHours: string;
  additionalHoursPrice: string;
  total: string;
  deposit: string;
  included: string;
  bookingProcess: string;
  ending: string;
};

const splitEditableLines = (value: string) =>
  value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

export function ProposalGenerator({ lead, service, proposal, selectedAddOns, onToggleAddOn }: ProposalGeneratorProps) {
  const performanceLead = usesShowPackagePricing(lead);
  const pdfRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const generatedEditableProposal = useMemo<EditableProposal>(
    () => ({
      title: `${service.name} Proposal`,
      intro: proposal.intro,
      packageName: proposal.packageName,
      packagePrice: formatCurrency(proposal.basePackagePrice),
      showDurationInPdf: true,
      showDurationLabel: proposal.showDurationLabel,
      reels: String(proposal.reelCount),
      reelDuration: proposal.reelDuration,
      additionalHours: proposal.additionalHours ? `${proposal.additionalHours}h` : "",
      additionalHoursPrice: proposal.additionalHours ? formatCurrency(proposal.additionalHoursPrice) : "",
      total: formatCurrency(proposal.price),
      deposit: formatCurrency(proposal.deposit),
      included: proposal.included.join("\n"),
      bookingProcess: proposal.bookingProcess.join("\n"),
      ending: proposal.ending,
    }),
    [proposal.bookingProcess, proposal.ending, proposal.included, proposal.intro, service.name],
  );
  const [editableProposal, setEditableProposal] = useState<EditableProposal>(generatedEditableProposal);

  useEffect(() => {
    setEditableProposal(generatedEditableProposal);
  }, [generatedEditableProposal]);

  const editableIncluded = splitEditableLines(editableProposal.included);
  const editableBookingProcess = splitEditableLines(editableProposal.bookingProcess);
  const proposalText = [
    editableProposal.intro,
    "",
    `Recommended package: ${editableProposal.packageName}`,
    `Package price: ${editableProposal.packagePrice}`,
    `Reels: ${editableProposal.reels}`,
    `Reel duration: ${editableProposal.reelDuration}`,
    ...(performanceLead && editableProposal.showDurationInPdf ? [`Show duration: ${editableProposal.showDurationLabel}`] : []),
    ...(proposal.additionalHours > 0 ? [`Additional hours: ${editableProposal.additionalHours} (${editableProposal.additionalHoursPrice})`] : []),
    ...(proposal.packageNote ? [`Package note: ${proposal.packageNote}`] : []),
    `Total: ${editableProposal.total}`,
    `Deposit to book: ${editableProposal.deposit}`,
    "",
    "Included:",
    ...editableIncluded.map((item) => `- ${item}`),
    ...(proposal.addOns.length ? ["", "Selected add-ons:", ...proposal.addOns.map((item: AddOn) => `- ${item.name}: ${formatCurrency(item.price)}`)] : []),
    "",
    "Booking process:",
    ...editableBookingProcess.map((item, index) => `${index + 1}. ${item}`),
    "",
    editableProposal.ending,
  ].join("\n");
  const safeClientName = (lead.clientName || "client")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const proposalTitle = editableProposal.title || `${service.name} Proposal`;
  const updateEditableProposal = <Key extends keyof EditableProposal>(field: Key, value: EditableProposal[Key]) => {
    setEditableProposal((current) => ({ ...current, [field]: value }));
  };

  const exportProposalPdf = async () => {
    if (!pdfRef.current) return;

    setIsExporting(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        backgroundColor: "#050505",
        scale: 2,
        useCORS: true,
        logging: false,
        width: 816,
        height: 1056,
        windowWidth: 816,
        windowHeight: 1056,
      });
      const image = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "letter", compress: true });
      pdf.addImage(image, "JPEG", 0, 0, 612, 792, undefined, "FAST");
      pdf.save(`the-k-reaction-proposal-${safeClientName || "client"}.pdf`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
    <Card>
      <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Proposal Generator</h2>
          <p className="mt-1 text-sm text-studio-muted">
            Generated from selected service, {performanceLead ? "how long the show will be" : "coverage"}, add-ons, and location.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => copyText(proposalText)}>
            <Copy className="h-4 w-4" />
            Copy
          </Button>
          <Button variant="primary" onClick={exportProposalPdf} disabled={isExporting}>
            <FileDown className="h-4 w-4" />
            {isExporting ? "Exporting" : "PDF"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div id="proposal-print" className="rounded-lg border border-studio-line bg-black/25 p-5">
          <div className="flex items-center gap-4">
            <div className="print-logo-panel flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-studio-accent/40 bg-black shadow-red">
              <img src="/brand/the-k-reaction-mark.jpeg" alt="The K Reaction logo" className="brand-logo h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-sm uppercase tracking-normal text-studio-accent">The K Reaction Proposal</p>
              <h3 className="mt-2 text-2xl font-semibold">{lead.clientName || "New Client"} · {proposalTitle}</h3>
            </div>
          </div>
          <div className="mt-3 print-client-block">
            <p className="hidden text-xs uppercase text-studio-muted print:block">Client</p>
            <p className="hidden text-base font-semibold text-white print:block">{lead.clientName || "New Client"}</p>
          </div>
          <p className="mt-4 leading-7 text-zinc-300 print-hide">{editableProposal.intro}</p>
          <div className="proposal-summary-grid mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="proposal-summary-card min-h-24 rounded-lg border border-studio-accent/50 bg-studio-accent/10 p-3 shadow-red">
              <p className="text-xs font-medium uppercase tracking-normal text-red-200">Recommended package</p>
              <p className="mt-2 text-xl font-semibold text-white">{editableProposal.packageName}</p>
            </div>
            <div className="proposal-summary-card min-h-24 rounded-lg border border-studio-line bg-white/[0.04] p-3">
              <p className="text-xs font-medium uppercase tracking-normal text-studio-muted">Package price</p>
              <p className="mt-2 text-xl font-semibold">{editableProposal.packagePrice}</p>
            </div>
            {performanceLead && (
              <div className="proposal-summary-card min-h-24 rounded-lg border border-studio-line bg-white/[0.04] p-3">
                <p className="text-xs font-medium uppercase tracking-normal text-studio-muted">Show duration</p>
                <p className="mt-2 text-xl font-semibold">{editableProposal.showDurationLabel}</p>
              </div>
            )}
            <div className="proposal-summary-card min-h-24 rounded-lg border border-studio-line bg-white/[0.04] p-3">
              <p className="text-xs font-medium uppercase tracking-normal text-studio-muted">Reels</p>
              <p className="mt-2 text-xl font-semibold">{editableProposal.reels}</p>
              <p className="mt-0.5 text-xs text-studio-muted">{editableProposal.reelDuration}</p>
            </div>
            {proposal.additionalHours > 0 && (
              <div className="proposal-summary-card min-h-24 rounded-lg border border-studio-accent/40 bg-studio-accent/10 p-3">
                <p className="text-xs font-medium uppercase tracking-normal text-red-200">Additional hours</p>
                <p className="mt-2 text-xl font-semibold">{editableProposal.additionalHours}</p>
                <p className="mt-0.5 text-xs text-studio-muted">{editableProposal.additionalHoursPrice}</p>
              </div>
            )}
            <div className="proposal-summary-card min-h-24 rounded-lg border border-studio-line bg-white/[0.04] p-3">
              <p className="text-xs font-medium uppercase tracking-normal text-studio-muted">Total</p>
              <p className="mt-2 text-xl font-semibold">{editableProposal.total}</p>
            </div>
            <div className="proposal-summary-card min-h-24 rounded-lg border border-studio-line bg-white/[0.04] p-3">
              <p className="text-xs font-medium uppercase tracking-normal text-studio-muted">Deposit</p>
              <p className="mt-2 text-xl font-semibold">{editableProposal.deposit}</p>
              <p className="mt-0.5 text-xs text-studio-muted">50% of package</p>
            </div>
          </div>
          {proposal.packageNote && (
            <p className="mt-4 rounded-md border border-studio-accent/40 bg-studio-accent/10 px-3 py-2 text-sm text-red-100">
              {proposal.packageNote}
            </p>
          )}
          <h4 className="proposal-section-title mt-6 font-semibold">What’s included</h4>
          <ul className="proposal-section mt-3 grid auto-rows-fr gap-2 text-sm text-zinc-300 sm:grid-cols-2 xl:grid-cols-1">
            {editableIncluded.map((item) => (
              <li key={item} className="grid min-h-11 items-center rounded-md border border-studio-line bg-white/[0.03] px-3 py-2 leading-5">
                <span className="block">{item}</span>
              </li>
            ))}
          </ul>
          {proposal.addOns.length > 0 && (
            <>
              <h4 className="mt-6 font-semibold print-hide">Selected add-ons</h4>
              <ul className="mt-3 grid gap-2 text-sm text-zinc-300">
                {proposal.addOns.map((addOn) => (
                  <li key={addOn.id} className="print-hide rounded-md border border-studio-line bg-white/[0.03] px-3 py-2">
                    {addOn.name}: {formatCurrency(addOn.price)}
                  </li>
                ))}
              </ul>
            </>
          )}
          <h4 className="proposal-section-title mt-6 font-semibold">Booking process</h4>
          <ol className="proposal-section mt-3 grid auto-rows-fr gap-2 text-sm text-zinc-300">
            {editableBookingProcess.map((item, index) => (
              <li key={item} className="grid min-h-11 grid-cols-[2rem_minmax(0,1fr)] items-center rounded-md border border-studio-line bg-white/[0.03] px-3 py-2 leading-5">
                <span className="font-semibold text-studio-accent">{index + 1}.</span>
                <span className="block">{item}</span>
              </li>
            ))}
          </ol>
          <p className="proposal-final-note mt-6 text-zinc-300">{editableProposal.ending}</p>
        </div>
        <aside className="grid content-start gap-4">
          <div className="rounded-lg border border-studio-line bg-white/[0.035] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">Editable proposal preview</p>
                <p className="mt-1 text-xs leading-5 text-studio-muted">Adjust client-facing copy before exporting the PDF.</p>
              </div>
              <Button variant="secondary" onClick={() => setEditableProposal(generatedEditableProposal)}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                Proposal title
                <input
                  value={editableProposal.title}
                  onChange={(event) => updateEditableProposal("title", event.target.value)}
                  className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                Intro message
                <textarea
                  value={editableProposal.intro}
                  onChange={(event) => updateEditableProposal("intro", event.target.value)}
                  rows={4}
                  className="resize-y rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case leading-6 text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                />
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                  Package recommendation
                  <input
                    value={editableProposal.packageName}
                    onChange={(event) => updateEditableProposal("packageName", event.target.value)}
                    className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                  Package price
                  <input
                    value={editableProposal.packagePrice}
                    onChange={(event) => updateEditableProposal("packagePrice", event.target.value)}
                    className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                  />
                </label>
                {performanceLead && (
                  <div className="grid gap-2 rounded-md border border-studio-line bg-black/25 p-3 sm:col-span-2">
                    <label className="flex items-center justify-between gap-3 text-xs font-medium uppercase tracking-normal text-studio-muted">
                      <span>Show duration in PDF</span>
                      <input
                        type="checkbox"
                        checked={editableProposal.showDurationInPdf}
                        onChange={(event) => updateEditableProposal("showDurationInPdf", event.target.checked)}
                        className="h-4 w-4 accent-studio-accent"
                      />
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                      Show duration
                      <input
                        value={editableProposal.showDurationLabel}
                        onChange={(event) => updateEditableProposal("showDurationLabel", event.target.value)}
                        className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                      />
                    </label>
                  </div>
                )}
                <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                  Reels
                  <input
                    value={editableProposal.reels}
                    onChange={(event) => updateEditableProposal("reels", event.target.value)}
                    className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                  Reel duration
                  <input
                    value={editableProposal.reelDuration}
                    onChange={(event) => updateEditableProposal("reelDuration", event.target.value)}
                    className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                  />
                </label>
                {proposal.additionalHours > 0 && (
                  <>
                    <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                      Additional hours
                      <input
                        value={editableProposal.additionalHours}
                        onChange={(event) => updateEditableProposal("additionalHours", event.target.value)}
                        className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                      />
                    </label>
                    <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                      Additional hours price
                      <input
                        value={editableProposal.additionalHoursPrice}
                        onChange={(event) => updateEditableProposal("additionalHoursPrice", event.target.value)}
                        className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                      />
                    </label>
                  </>
                )}
                <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                  Total
                  <input
                    value={editableProposal.total}
                    onChange={(event) => updateEditableProposal("total", event.target.value)}
                    className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                  />
                </label>
                <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                  Deposit
                  <input
                    value={editableProposal.deposit}
                    onChange={(event) => updateEditableProposal("deposit", event.target.value)}
                    className="rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                  />
                </label>
              </div>
              <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                What’s included
                <textarea
                  value={editableProposal.included}
                  onChange={(event) => updateEditableProposal("included", event.target.value)}
                  rows={6}
                  className="resize-y rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case leading-6 text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                Booking process
                <textarea
                  value={editableProposal.bookingProcess}
                  onChange={(event) => updateEditableProposal("bookingProcess", event.target.value)}
                  rows={5}
                  className="resize-y rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case leading-6 text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                />
              </label>
              <label className="grid gap-1.5 text-xs font-medium uppercase tracking-normal text-studio-muted">
                Final note
                <textarea
                  value={editableProposal.ending}
                  onChange={(event) => updateEditableProposal("ending", event.target.value)}
                  rows={3}
                  className="resize-y rounded-md border border-studio-line bg-black/40 px-3 py-2 text-sm normal-case leading-6 text-white outline-none transition focus:border-studio-accent focus:shadow-red"
                />
              </label>
            </div>
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-white">Add-ons</p>
            <div className="grid gap-2">
              {service.addOns.map((addOn) => (
                <label key={addOn.id} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-studio-line bg-white/[0.03] p-3 text-sm">
                  <span>
                    <span className="block font-medium">{addOn.name}</span>
                    <span className="text-studio-muted">{formatCurrency(addOn.price)}</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(addOn.id)}
                    onChange={() => onToggleAddOn(addOn.id)}
                    className="h-4 w-4 accent-studio-accent"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-studio-line bg-studio-accent/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-studio-accent">
              <Sparkles className="h-4 w-4" />
              AI Suggestions
            </div>
            <div className="mt-3 grid gap-2 text-sm text-zinc-300">
              {proposal.suggestions.map((suggestion) => (
                <p key={suggestion}>{suggestion}</p>
              ))}
            </div>
          </div>
        </aside>
      </CardContent>
    </Card>
    <div className="pdf-export-stage" aria-hidden="true">
      <div ref={pdfRef} className="pdf-export-page">
        <div className="pdf-export-header">
          <div className="pdf-export-logo">
            <img src="/brand/the-k-reaction-mark.jpeg" alt="" />
          </div>
          <div>
            <p className="pdf-export-kicker">The K Reaction Proposal</p>
            <h2>{proposalTitle}</h2>
            <p className="pdf-export-client">{lead.clientName || "New Client"}</p>
          </div>
        </div>

        <section className="pdf-export-section pdf-export-intro">
          <h3>Proposal note</h3>
          <p>{editableProposal.intro}</p>
        </section>

        <div className="pdf-export-summary">
          <div className="pdf-export-card pdf-export-card-feature">
            <span>Package recommendation</span>
            <strong>{editableProposal.packageName}</strong>
          </div>
          <div className="pdf-export-card">
            <span>Package price</span>
            <strong>{editableProposal.packagePrice}</strong>
          </div>
          {editableProposal.showDurationInPdf && (
            <div className="pdf-export-card">
              <span>Show duration</span>
              <strong>{editableProposal.showDurationLabel}</strong>
            </div>
          )}
          <div className="pdf-export-card">
            <span>Reels included</span>
            <strong>{editableProposal.reels}</strong>
            <small>{editableProposal.reelDuration}</small>
          </div>
          {proposal.additionalHours > 0 && (
            <div className="pdf-export-card">
              <span>Additional hours</span>
              <strong>{editableProposal.additionalHours}</strong>
              <small>{editableProposal.additionalHoursPrice}</small>
            </div>
          )}
          <div className="pdf-export-card">
            <span>Total</span>
            <strong>{editableProposal.total}</strong>
          </div>
          <div className="pdf-export-card">
            <span>Deposit</span>
            <strong>{editableProposal.deposit}</strong>
            <small>50% of package</small>
          </div>
        </div>

        <section className="pdf-export-section">
          <h3>What’s included</h3>
          <ul>
            {editableIncluded.slice(0, 8).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="pdf-export-section">
          <h3>Booking process</h3>
          <ol>
            {editableBookingProcess.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>

        <p className="pdf-export-cta">{editableProposal.ending}</p>
      </div>
    </div>
    </>
  );
}
