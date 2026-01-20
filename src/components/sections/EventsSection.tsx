import { MapPin, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import broadcasterImg from "@/assets/events/broadcaster.png";
import handandflowerImg from "@/assets/events/handandflower.png";
import travellerImg from "@/assets/events/traveller.png";
interface Event {
  id: number;
  title: string;
  location: string;
  venue: string;
  image: string;
}
const events: Event[] = [{
  id: 1,
  title: "NAB Review 2026",
  location: "White City, London, UK",
  venue: "The Broadcaster",
  image: broadcasterImg
}, {
  id: 2,
  title: "Post MPTS Drinks Reception",
  location: "Olympia London, UK",
  venue: "The Hand & Flower",
  image: handandflowerImg
}, {
  id: 3,
  title: "IBC Breakfast",
  location: "RAI, Amsterdam, Netherlands",
  venue: "The Traveller",
  image: travellerImg
}];
interface EventsSectionProps {
  onRegisterClick: () => void;
}
const EventsSection = ({
  onRegisterClick
}: EventsSectionProps) => {
  return <section className="py-24 bg-gradient-to-b from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div className="text-center mb-16" initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true
      }} transition={{
        duration: 0.6
      }}>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Upcoming <span className="text-gradient">Events</span>
          </h2>
          
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {events.map((event, index) => <motion.div key={event.id} initial={{
          opacity: 0,
          y: 30
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.15
        }}>
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden group hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 h-full flex flex-col">
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-muted/30 to-muted/10 flex items-center justify-center px-6 flex-shrink-0">
                  <img src={event.image} alt={event.title} className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
                <CardContent className="p-6 space-y-4 flex flex-col flex-1">
                  <div className="space-y-2">
                    <p className="text-xs font-medium tracking-wider uppercase text-primary/80">
                      {event.venue}
                    </p>
                    <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                      {event.title}
                    </h3>
                  </div>
                  <div className="flex items-start gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 text-primary/70 flex-shrink-0" />
                    <span className="text-sm leading-relaxed">{event.location}</span>
                  </div>
                  <Button onClick={onRegisterClick} className="w-full mt-auto bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/30 hover:border-primary group/btn transition-all duration-300">
                    <span>LEARN MORE</span>
                    <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-300" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </section>;
};
export default EventsSection;