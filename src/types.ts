export type LeadStatus = "New Lead" | "Waiting" | "Proposal Sent" | "Booked" | "Closed";

export type Lead = {
  id: string;
  clientName: string;
  instagram: string;
  contact: string;
  serviceRequested: string;
  eventDate: string;
  location: string;
  hours: number;
  budget: number;
  notes: string;
  status: LeadStatus;
  liveRecordingDetails?: LiveRecordingDetails;
};

export type LiveRecordingDetails = {
  performanceLocation: string;
  performanceDate: string;
  callTime: string;
  performanceStartTime: string;
  totalPerformanceDuration: number;
  numberOfPerformers: number;
  audioBoardAccess: boolean;
  needPromoReels: boolean;
  multiCameraSetup: boolean;
  notes: string;
};

export type Service = {
  id: string;
  name: string;
  basePrice: number;
  description: string;
  deliverables: string[];
  addOns: AddOn[];
  depositAmount: number;
  turnaround: string;
};

export type AddOn = {
  id: string;
  name: string;
  price: number;
};

export type Proposal = {
  intro: string;
  price: number;
  packageName: string;
  basePackagePrice: number;
  reelCount: number;
  reelDuration: string;
  showDuration: number;
  showDurationLabel: string;
  additionalHours: number;
  additionalHoursPrice: number;
  packageNote?: string;
  deposit: number;
  included: string[];
  addOns: AddOn[];
  bookingProcess: string[];
  ending: string;
  suggestions: string[];
};
