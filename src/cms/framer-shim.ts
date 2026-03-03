// A no-op framer-motion shim for Decap CMS v3 preview.
// Prevents useContext() and layout measurement crashes.

export const motion: any = new Proxy({}, {
  get: () => {
    return function NoopComponent(props: any) {
      return props?.children ?? null;
    };
  }
});

export const useScroll = () => ({
  scrollY: {
    on: () => {},
    get: () => 0,
  },
});

export const useTransform = () => 0;

export class MotionValue {
  get() {
    return 0;
  }
}

export default {};
