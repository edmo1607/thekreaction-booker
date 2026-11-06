import type { AddOn, Lead, Proposal, Service } from "../types";

const extraHourRate = 125;
const includedPremiumHours = 4;
const additionalHoursBlockSize = 3;
const additionalHoursBlockPrice = 200;
const performanceLeadPattern =
  /live performance|artist performance|stage performance|dj set|music performance|concert|show recording|live set|performance recording|recorded performance|event coverage|stage show|show/i;

type ShowPackage = {
  name: "Basic" | "Standard" | "Premium";
  price: number;
  reelCount: number;
  included: string[];
  note?: string;
};

export function getShowPackage(showDuration: number): ShowPackage {
  if (showDuration <= 1) {
    return {
      name: "Basic",
      price: 300,
      reelCount: 2,
      included: ["Live performance recording", "2 reels for social media", "Basic color correction", "Audio sync"],
    };
  }

  if (showDuration <= 2) {
    return {
      name: "Standard",
      price: 350,
      reelCount: 3,
      included: ["Live performance recording", "3 reels for social media", "Color correction", "Audio sync"],
    };
  }

  return {
    name: "Premium",
    price: 500,
    reelCount: 4,
    included: ["Live performance recording", "4 reels for social media", "Color correction", "Audio sync", "Priority edit planning"],
    note: showDuration > 4 ? "Additional hours are required for shows longer than 4 hours." : undefined,
  };
}

export function isLiveRecordingService(lead: Pick<Lead, "serviceRequested">) {
  return /live recording/i.test(lead.serviceRequested);
}

function getLiveRecordingPackage(durationMinutes: number): ShowPackage {
  if (durationMinutes <= 60) {
    return {
      name: "Standard",
      price: 350,
      reelCount: 3,
      included: ["Live performance recording", "3 reels for social media", "Synced audio edit", "Color correction"],
    };
  }

  return {
    name: "Premium",
    price: 500,
    reelCount: 4,
    included: ["Live performance recording", "4 reels for social media", "Synced audio edit", "Color correction", "Priority edit planning"],
    note: durationMinutes > 90 ? "Additional coverage time required" : undefined,
  };
}

export function isPerformanceLead(lead: Pick<Lead, "serviceRequested" | "notes">) {
  return performanceLeadPattern.test(`${lead.serviceRequested} ${lead.notes}`);
}

export function usesShowPackagePricing(lead: Pick<Lead, "serviceRequested" | "notes">) {
  return (
    isLiveRecordingService(lead) ||
    isPerformanceLead(lead) ||
    /event recap videos|live set recording|custom projects/i.test(lead.serviceRequested)
  );
}

export function calculateProposal(lead: Lead, service: Service, addOns: AddOn[]): Proposal {
  const liveRecording = isLiveRecordingService(lead);
  const performanceLead = usesShowPackagePricing(lead);
  const liveDurationMinutes = Math.max(1, lead.liveRecordingDetails?.totalPerformanceDuration || Math.round((lead.hours || 1) * 60));
  const showDuration = Math.max(0, lead.hours || 0);
  const showPackage = liveRecording ? getLiveRecordingPackage(liveDurationMinutes) : getShowPackage(showDuration || 1);
  const packageIncluded = getPackageIncluded(lead, showPackage);
  const additionalHours = performanceLead && !liveRecording ? Math.max(0, Math.ceil((showDuration || 1) - includedPremiumHours)) : 0;
  const additionalHoursPrice = additionalHours > 0 ? Math.ceil(additionalHours / additionalHoursBlockSize) * additionalHoursBlockPrice : 0;
  const durationAdjustment = performanceLead ? 0 : Math.max(0, lead.hours - 2) * extraHourRate;
  const locationFee = /miami|wynwood|doral|brickell/i.test(lead.location) ? 0 : 150;
  const addOnTotal = addOns.reduce((sum, addOn) => sum + addOn.price, 0);
  const basePackagePrice = performanceLead ? showPackage.price : service.basePrice + durationAdjustment + locationFee;
  const price = basePackagePrice + additionalHoursPrice + addOnTotal;
  const deposit = Math.round(basePackagePrice * 0.5);
  const suggestions = buildSuggestions(lead, service, price);
  const showDurationLabel = liveRecording ? `${liveDurationMinutes} minutes` : `${showDuration || 1} hour${(showDuration || 1) === 1 ? "" : "s"}`;
  const durationLine = liveRecording
    ? `${showDurationLabel} total performance duration`
    : performanceLead
    ? `${showDuration || 1} hours total show duration`
    : `${lead.hours || 2} hours of coverage`;

  return {
    intro: performanceLead
      ? `Hi ${lead.clientName || "there"}! Thanks for reaching out to The K Reaction. Based on a ${showDurationLabel} ${lead.serviceRequested.toLowerCase()} request, the recommended package is ${showPackage.name}. This setup is built to capture the event and prepare polished assets for social, promo, and booking momentum.`
      : `Hi ${lead.clientName || "there"}! Thanks for reaching out to The K Reaction. Based on your ${lead.serviceRequested.toLowerCase()} request in ${lead.location || "your location"}, this package would give you a polished creative delivery built for Instagram, promo, and booking momentum.`,
    price,
    packageName: performanceLead ? showPackage.name : service.name,
    basePackagePrice,
    reelCount: performanceLead ? showPackage.reelCount : inferReelCount(service),
    reelDuration: "15-30 seconds",
    showDuration: liveRecording ? liveDurationMinutes : showDuration || lead.hours || 1,
    showDurationLabel,
    additionalHours,
    additionalHoursPrice,
    packageNote: additionalHours > 0 ? `${additionalHours} additional hours added to the proposal.` : performanceLead ? showPackage.note : undefined,
    deposit,
    included: [
      ...(performanceLead ? packageIncluded : service.deliverables),
      durationLine,
      ...(additionalHours > 0 ? [`${additionalHours} additional hours included`] : []),
      ...(performanceLead ? [] : [locationFee > 0 ? "Travel coordination included in estimate" : "Local Miami-area coverage"]),
    ],
    addOns,
    bookingProcess: [
      "Confirm the scope, date, location, and final deliverables.",
      `Secure the date with a deposit of $${deposit}.`,
      "Receive a production confirmation with timing, contact details, and shot priorities.",
      `Final assets are delivered within ${service.turnaround}.`,
    ],
    ending: "If this looks good, we can lock the date and prepare the booking confirmation today.",
    suggestions,
  };
}

function getPackageIncluded(lead: Lead, showPackage: ShowPackage) {
  if (isLiveRecordingService(lead)) {
    return showPackage.included;
  }

  if (/event recap videos/i.test(lead.serviceRequested)) {
    return [
      "Event recap video coverage",
      `${showPackage.reelCount} reels for social media`,
      "Color correction",
      ...(showPackage.name === "Premium" ? ["Priority edit planning"] : []),
    ];
  }

  return showPackage.included;
}

export function recommendService(lead: Lead, services: Service[]) {
  const text = `${lead.serviceRequested} ${lead.notes}`.toLowerCase();
  if (isLiveRecordingService(lead)) {
    return services.find((service) => service.name === "Live Recording") ?? services[0];
  }

  if (isPerformanceLead(lead) && !/event recap videos/i.test(lead.serviceRequested)) {
    return services.find((service) => service.id === "live-set") ?? services[0];
  }

  return (
    services.find((service) => text.includes(service.name.toLowerCase())) ??
    services.find((service) => service.name.toLowerCase().split(" ").some((word) => text.includes(word))) ??
    services[0]
  );
}

function buildSuggestions(lead: Lead, service: Service, price: number) {
  const liveRecording = isLiveRecordingService(lead);
  const performanceLead = usesShowPackagePricing(lead);
  const liveDurationMinutes = Math.max(1, lead.liveRecordingDetails?.totalPerformanceDuration || Math.round((lead.hours || 1) * 60));
  const showPackage = liveRecording ? getLiveRecordingPackage(liveDurationMinutes) : getShowPackage(Math.max(0, lead.hours || 1));
  const suggestions = [
    liveRecording
      ? `AI package match: ${showPackage.name} package for a ${liveDurationMinutes}-minute live recording`
      : 
    performanceLead
      ? `AI package match: ${showPackage.name} package for a ${lead.hours || 1}-hour show`
      : `AI package match: ${service.name}`,
  ];

  if (lead.budget && lead.budget < price) {
    suggestions.push("Client budget is under the estimate. Offer a lighter deliverable set or shorter edit count.");
  } else if (lead.budget && lead.budget > price + 400) {
    suggestions.push("Budget has room for an upsell. Recommend short promo clips/reels or photo coverage.");
  }

  if (performanceLead) {
    suggestions.push(`Base package price: $${showPackage.price}. Reel duration: 15-30 seconds.`);
    suggestions.push("Use how long the show will be to estimate camera runtime, audio sync needs, and final package fit.");
    if (!liveRecording && lead.hours > includedPremiumHours) {
      const additionalHours = Math.ceil(lead.hours - includedPremiumHours);
      const additionalHoursPrice = Math.ceil(additionalHours / additionalHoursBlockSize) * additionalHoursBlockPrice;
      suggestions.push(`Additional coverage: ${additionalHours} hours added for $${additionalHoursPrice}.`);
    } else if (showPackage.note) {
      suggestions.push(showPackage.note);
    }
  } else if (lead.hours >= 4) {
    suggestions.push("Longer coverage request detected. Suggest a second shooter or extra camera angle.");
  }

  if (/club|night|dj|music|set/i.test(`${lead.notes} ${lead.serviceRequested}`)) {
    suggestions.push("Audio and nightlife context detected. Mention clean audio sync and vertical highlight clips.");
  }

  suggestions.push("Suggested deposit: 50% of the selected package price.");
  return suggestions;
}

export function getLiveRecordingGuide(lead: Lead) {
  const details = lead.liveRecordingDetails;
  const duration = Math.max(1, details?.totalPerformanceDuration || Math.round((lead.hours || 1) * 60));
  const showPackage = getLiveRecordingPackage(duration);
  const complexityScore =
    (duration > 90 ? 2 : duration > 60 ? 1 : 0) +
    (details?.multiCameraSetup ? 2 : 0) +
    (details?.needPromoReels ? 1 : 0) +
    (details?.audioBoardAccess ? 0 : 1) +
    ((details?.numberOfPerformers || 1) > 3 ? 1 : 0);
  const complexity = complexityScore >= 4 ? "High" : complexityScore >= 2 ? "Medium" : "Simple";
  const marketRate = details?.multiCameraSetup
    ? details.needPromoReels || details.audioBoardAccess
      ? "$800-2000"
      : "$700-1500"
    : "$300-500";

  return {
    suggestedPackage: showPackage.name,
    suggestedMarketRate: marketRate,
    productionComplexity: complexity,
    recommendedCameraSetup: details?.multiCameraSetup
      ? "Recommend 2-camera setup due to stage movement."
      : "Simple 1-camera setup can work if stage movement is limited.",
    suggestedUpsells: details?.needPromoReels ? "Promo reels already requested. Consider extra reel bundle." : "Upsell opportunity: promo reels.",
    audioRecommendations: details?.audioBoardAccess
      ? "Audio board access recommended. Capture a direct feed plus camera scratch audio."
      : "Request audio board access. If unavailable, plan external recorder placement.",
    riskNotes:
      duration > 90
        ? "Longer runtime increases storage, battery, sync, and coverage risk."
        : "Confirm call time, stage lighting, and audio source before booking.",
  };
}

function inferReelCount(service: Service) {
  const reelDeliverable = service.deliverables.find((deliverable) => /\d+\s+(vertical\s+)?reels?/i.test(deliverable));
  const match = reelDeliverable?.match(/\d+/);
  return match ? Number(match[0]) : 0;
}
