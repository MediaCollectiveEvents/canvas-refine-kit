import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import nabReviewImg from "@/assets/events/nab-review.png";
import mptsDrinksImg from "@/assets/events/mpts-drinks.png";
import travellerImg from "@/assets/events/traveller.png";

interface Event {
  id: number;
  title: string;
  location: string;
  venue: string;
  image: string;
}

const events: Event[] = [
  {
    id: 1,
    title: "NAB Review",
    location: "White City, London, UK",
    venue: "White City",
    image: nabReviewImg,
  },
  {
    id: 2,
    title: "Post MPTS Drinks Reception",
    location: "Olympia London, UK",
    venue: "Olympia",
    image: mptsDrinksImg,
  },
  {
    id: 3,
    title: "IBC Breakfast",
    location: "The Traveller, RAI, Amsterdam, Netherlands",
    venue: "The Traveller",
    image: travellerImg,
  },
];

interface EventsSectionProps {
  onRegisterClick: () => void;
}

const EventsSection = ({ onRegisterClick }: EventsSectionProps) => {
  return (
    <section className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Upcoming <span className="text-primary">Events</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join us at our exclusive industry events designed to connect media professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {events.map((event) => (
            <Card
              key={event.id}
              className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all duration-300"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {event.title}
                </h3>
                <div className="flex items-start gap-2 text-muted-foreground mb-4">
                  <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <span className="text-sm">{event.location}</span>
                </div>
                <Button
                  onClick={onRegisterClick}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Register Interest
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
