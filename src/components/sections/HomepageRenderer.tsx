import { AboutIntroSection } from "./AboutIntroSection";
import WhoAttendsSection from "./WhoAttendsSection"; // your existing file
import { UpcomingEventsIntroSection } from "./UpcomingEventsIntroSection"; // we will create this next
import FAQSection from "./FAQSection"; // your existing one
import AboutSection from "./AboutSection"; // existing
import EventsSection from "./EventsSection"; // existing
import ValuePillarsSection from "./ValuePillarsSection"; // existing

export function HomepageRenderer({ sections, onRegister }) {
  return (
    <>
      {sections.map((section: any, i: number) => {
        switch (section.type) {
          case "aboutIntro":
            return <AboutIntroSection key={i} section={section} />;

          case "whoAttends":
            return <WhoAttendsSection key={i} />; // your existing design

          case "upcomingEventsIntro":
            return (
              <UpcomingEventsIntroSection
                key={i}
                section={section}
                onRegister={onRegister}
              />
            );

          case "testimonials":
          case "partners":
          case "joinCommunity":
          case "newHere":
          case "forBrands":
            return null; // not built yet — will add one at a time safely

          default:
            return null;
        }
      })}
    </>
  );
}
