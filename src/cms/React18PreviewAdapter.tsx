import React from "react";
import { createRoot, type Root } from "react-dom/client";

// Decap's React 16 renderer owns only this hook-free host. The preview tree
// belongs to its own React 18 root, so hooks use the matching dispatcher.
export default function adaptPreview<Props extends object>(Preview: React.ComponentType<Props>) {
  return class React18PreviewAdapter extends React.Component<Props> {
    private container = React.createRef<HTMLDivElement>();
    private root: Root | null = null;

    componentDidMount() {
      this.root = createRoot(this.container.current!);
      this.root.render(<Preview {...this.props} />);
    }

    componentDidUpdate() {
      this.root?.render(<Preview {...this.props} />);
    }

    componentWillUnmount() {
      this.root?.unmount();
      this.root = null;
    }

    render() {
      return <div ref={this.container} />;
    }
  };
}
