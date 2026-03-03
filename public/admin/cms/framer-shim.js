// framer-motion shim for Decap preview (pure ASCII safe version)
export const motion = new Proxy({}, {
  get: function () {
    return function Noop(props) {
      return (props && props.children) ? props.children : null;
    };
  }
});

export const useScroll = function () {
  return {
    scrollY: {
      on: function () {},
      get: function () { return 0; }
    }
  };
};

export const useTransform = function () {
  return 0;
};

export class MotionValue {
  get() {
    return 0;
  }
}

export default {};
