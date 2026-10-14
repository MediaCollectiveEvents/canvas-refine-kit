import type { EventItem } from "./events";
// Event artwork from assets
import broadcaster from "@/assets/events/broadcaster.png";
import handandflower from "@/assets/events/handandflower.png";
import traveller from "@/assets/events/traveller.png";

const eventImages: Record<string, string> = {
  "off-air": "/uploads/off-air.png",
  "mpts-networking-reception-2027": "/uploads/Venue tiles/Handandflower.png",
  "ibc-networking-breakfast-2027": "/uploads/Venue tiles/RAI.png",
  "ibc-decompression-party-2027": "/uploads/Venue tiles/Livepiano.png",
  greenline: "/uploads/Venue tiles/Eurostar.png",
  broadcaster,
  handandflower,
  traveller,
};

export function getEventImage(event: EventItem, legacyFallback = true): string | undefined {
  return event.image || eventImages[event.imageKey || ""] || (legacyFallback ? ({ 1: broadcaster, 2: handandflower, 3: traveller } as Record<number, string>)[event.id] : undefined);
}
