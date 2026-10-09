import { losslessHeroSource } from "@/lib/heroImages";
/** Shared temporary artwork; callers can supply a page-specific source later. */
export default function MobileHeroArtwork({ src = "/uploads/website-hero-mobile.png" }: { src?: string }) {
  return (
    <picture aria-hidden="true" className="absolute inset-0 bg-[#101d24] sm:hidden">
      {losslessHeroSource(src) && <source media="(width < 640px)" type="image/webp" srcSet={losslessHeroSource(src)} />}
      <source media="(width < 640px)" srcSet={src} />
      <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" width={1620} height={2025} className="h-full w-full object-contain object-bottom" />
    </picture>
  );
}
