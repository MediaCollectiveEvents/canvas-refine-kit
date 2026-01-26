
import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import EventRegistrationForm from "@/components/EventRegistrationForm";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/shared/PageHero";
import SectionDivider from "@/components/shared/SectionDivider";
import SectionHeader from "@/components/shared/SectionHeader";

import greenline from "@/assets/events/greenline.png";
import broadcaster from "@/assets/events/broadcaster.png";
import handandflower from "@/assets/events/handandflower.png";
import traveller from "@/assets/events/traveller.png";

interface Event {
  id: number;
  title: string;
  venue: string;
  location: string;
  image: string;
  date: string;
  time: string;
  description: string;
  type: "upcoming" | "past";
}

const events: Event[] = [
  {
    id: 1,
    title: "Networking Breakfast",
    venue: "IBC - RAI",
    location: "Amsterdam",
    image: greenline,
    date: "14th September 2025",
    time: "08:30 - 10:30",
    description:
      "Start your IBC experience with an exclusive breakfast gathering. Connect with industry leaders and fellow professionals over artisan coffee and pastries in a relaxed, intimate setting.",
    type: "upcoming",
  },
  {
    id: 2,
    title: "NAB Review",
    venue: "The Broadcaster, White City",
    location: "London",
    image: broadcaster,
    date: "24th April 2025",
    time: "18:00 - 21:00",
    description:
      "Join us for an evening of insights and discussion as we review the highlights from NAB Show. Industry experts will share key takeaways and emerging trends from the world's largest broadcasting event.",
    type: "upcoming",
  },
  {
    id: 3,
    title: "MPTS Drinks Reception",
    venue: "The Hand & Flower, Olympia",
    location: "London",
    image: handandflower,
    date: "12th March 2025",
    time: "17:30 - 20:00",
    description:
      "Unwind after MPTS with drinks and canapes at this charming venue just steps from Olympia. The perfect opportunity to debrief on the day's discoveries and expand your network.",
    type: "upcoming",
  },
  {
    id: 4,
    title: "IBC Drinks Reception",
    venue: "The Traveller",
    location: "Amsterdam",
    image: traveller,
    date: "15th September 2025",
    time: "18:00 - 21:00",
    description:
      "Cap off an exciting day at IBC with drinks and networking at The Traveller. Connect with peers and industry leaders in a relaxed atmosphere.",
    type: "upcoming",
  },
];

const EventCard = ({
  event,
  index,
  onRegisterClick,
}: {
  event: Event;
  index: number;
  onRegisterClick: (eventId: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: index * 0.15 }}
    viewport={{ once: true }}
    className="group"
  >
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
      {/* Image */}
      <div
        className={`relative overflow-hidden rounded-2xl ${
          index % 2 === 1 ? "lg:order-2" : ""
        }`}
      >
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div
        className={`space-y-6 ${
          index % 2 === 1 ? "lg:order-1 lg:text-right" : ""
        }`}
      >
        <div
          className={`flex items-center gap-3 text-muted-foreground font-body text-sm uppercase tracking-widest ${
            index % 2 === 1 ? "lg:justify-end" : ""
          }`}
        >
          <span>{event.date}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>{event.time}</span>
        </div>

        <h3 className="font-script text-4xl md:text-5xl text-foreground leading-tight">
          {event.title}
        </h3>

        <div
          className={`flex items-center gap-2 text-primary font-body uppercase tracking-wider text-sm ${
            index % 2 === 1 ? "lg:justify-end" : ""
          }`}
        >
          <span>{event.venue}</span>
          <span>—</span>
          <span>{event.location}</span>
        </div>

        <p className="text-muted-foreground font-body text-base leading-relaxed max-w-lg">
          {event.description}
        </p>

        <Button
          onClick={() =>
            onRegisterClick(
              event.id === 1
                ? "networking-breakfast"
                : event.id === 2
                ? "nab-review"
                : "mpts-drinks"
            )
          }
          className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-6"
        >
          Register Interest
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  </motion.div>
);

const Events = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>("");

  const upcomingEvents = events.filter((e) => e.type === "upcoming");
  const pastEvents = events.filter((e) => e.type === "past");

  const handleRegisterClick = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsFormOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <EventRegistrationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        preselectedEvent={selectedEventId}
      />

      {/* Hero Section */}
      <PageHero
        eyebrow="Upcoming Gatherings"
        title="Our Events"
        description="Join us at our carefully curated events designed to connect media, entertainment, and technology professionals."
        variant="primary"
      />

      {/* Decorative Divider */}
      <SectionDivider gradient />

      {/* Upcoming Events */}
      <section className="py-24 md:py-32 px-6">
        <div className="container mx-auto max-w-6xl">
          <SectionHeader
            title="Upcoming "
            accentWord="Events"
          />

          <div className="space-y-24">
            {upcomingEvents.map((event, index) => (
              <EventCard
                key={event.id}
                event={event}
                index={index}
                onRegisterClick={handleRegisterClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Decorative Divider before CTA */}
      <SectionDivider variant="single" />

      {/* Past Events - only show if there are any */}
      {pastEvents.length > 0 && (
        <section className="py-20 px-6 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <SectionHeader
              title="Past "
              accentWord="Events"
            />

            <div className="space-y-24">
              {pastEvents.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={index}
                  onRegisterClick={handleRegisterClick}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Decorative Divider before CTA */}
      <SectionDivider variant="triple" className="py-12" />

      {/* CTA Section */}
      <section className="py-24 md:py-32 px-6 bg-gradient-to-b from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight">
              Want to attend our next{" "}
              <span className="text-primary italic">event?</span>
            </h2>
            <p className="text-muted-foreground font-body text-lg mb-6 max-w-xl mx-auto">
              Become a member of The Media Collective and get exclusive access
              to all our events and networking opportunities.
            </p>
            <p className="text-muted-foreground/70 font-body text-sm mb-8 max-w-lg mx-auto">
              All events are free and by invitation only. Registering interest
              does not guarantee entry.
            </p>
            <Button
              size="lg"
              className="rounded-full font-body uppercase tracking-wider text-sm bg-primary text-primary-foreground hover:bg-primary/90 px-8"
              onClick={() => setIsFormOpen(true)}
            >
              Register Interest
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Events;
