// A no-op framer-motion shim for Decap CMS preview iframe.
// Prevents useContext() and layout measurement crashes.

export const motion = new Proxy({}, {
  get: () => (props: any) => props?.children ?? null
});

export const useScroll = () => ({
  scrollY: { on: () => {}, get: () => 0 },
});

export const useTransform = () => 0;

export class MotionValue {
  get() { return 0; }
}

export default {};
