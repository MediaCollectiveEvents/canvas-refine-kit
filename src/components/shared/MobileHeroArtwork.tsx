import { losslessHeroSource } from "@/lib/heroImages";
import { mobileHeroDelivery, mobileHeroes } from "@/lib/mobileHero.mjs";
/** Route artwork and its build-time preload share one delivery definition. */
export default function MobileHeroArtwork({ src, sizes = mobileHeroDelivery.sizes, path = "/" }: { src?: string; sizes?: string; path?: string }) {
  const delivery = mobileHeroes[path as keyof typeof mobileHeroes] ?? mobileHeroDelivery;
  const source = src ?? delivery.source;
  const responsive = source === delivery.source;
  const webp = responsive ? delivery.srcSet : losslessHeroSource(source);
  return (
    <picture aria-hidden="true" className="absolute inset-0 bg-[#101d24] sm:hidden">
      {webp && <source media={delivery.media} type="image/webp" srcSet={webp} sizes={responsive ? sizes : undefined} />}
      <source media="(width < 640px)" srcSet={source} />
      <img src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" width={delivery.width} height={delivery.height} fetchPriority="high" className="h-full w-full object-contain object-bottom" />
    </picture>
  );
}
