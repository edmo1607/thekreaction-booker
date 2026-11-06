import { Edit3, Plus } from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent, CardHeader } from "./ui/Card";
import { Field, Input, Textarea } from "./ui/Field";
import { formatCurrency } from "../lib/utils";
import type { Service } from "../types";

type ServicesManagerProps = {
  services: Service[];
  selectedServiceId: string;
  onSelectService: (id: string) => void;
  onUpdateService: (service: Service) => void;
  onAddService: () => void;
};

export function ServicesManager({ services, selectedServiceId, onSelectService, onUpdateService, onAddService }: ServicesManagerProps) {
  const selected = services.find((service) => service.id === selectedServiceId) ?? services[0];
  const update = <K extends keyof Service>(key: K, value: Service[K]) => onUpdateService({ ...selected, [key]: value });

  return (
    <Card>
      <CardHeader className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Services Database</h2>
          <p className="mt-1 text-sm text-studio-muted">Edit packages, deposits, deliverables, and add-ons.</p>
        </div>
        <Button size="icon" variant="secondary" onClick={onAddService} title="Add service">
          <Plus className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[240px_1fr]">
        <div className="grid gap-2">
          {services.map((service) => (
            <button
              key={service.id}
              onClick={() => onSelectService(service.id)}
              className={`rounded-lg border p-3 text-left transition ${
                selectedServiceId === service.id
                  ? "border-studio-accent/60 bg-studio-accent/10"
                  : "border-studio-line bg-white/[0.03] hover:bg-white/[0.07]"
              }`}
            >
              <p className="text-sm font-medium">{service.name}</p>
              <p className="mt-1 text-xs text-studio-muted">{formatCurrency(service.basePrice)}</p>
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Service name">
            <Input value={selected.name} onChange={(event) => update("name", event.target.value)} />
          </Field>
          <Field label="Base price">
            <Input type="number" value={selected.basePrice} onChange={(event) => update("basePrice", Number(event.target.value))} />
          </Field>
          <Field label="Deposit amount">
            <Input type="number" value={selected.depositAmount} onChange={(event) => update("depositAmount", Number(event.target.value))} />
          </Field>
          <Field label="Estimated turnaround">
            <Input value={selected.turnaround} onChange={(event) => update("turnaround", event.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea value={selected.description} onChange={(event) => update("description", event.target.value)} />
          </Field>
          <Field label="Deliverables">
            <Textarea
              value={selected.deliverables.join("\n")}
              onChange={(event) => update("deliverables", event.target.value.split("\n").filter(Boolean))}
            />
          </Field>
          <div className="md:col-span-2">
            <div className="mb-2 flex items-center gap-2 text-sm text-studio-muted">
              <Edit3 className="h-4 w-4" />
              Optional add-ons
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              {selected.addOns.map((addOn) => (
                <div key={addOn.id} className="rounded-lg border border-studio-line bg-black/25 p-3">
                  <p className="text-sm font-medium">{addOn.name}</p>
                  <p className="mt-1 text-sm text-studio-accent">{formatCurrency(addOn.price)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
