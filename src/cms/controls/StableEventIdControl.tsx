import React from "react";

interface Props {
  value?: unknown;
  forID?: string;
  className?: string;
  onChange(value: unknown): void;
}

// Class control deliberately avoids sharing hook dispatchers with Decap's React.
export default class StableEventIdControl extends React.Component<Props> {
  private readonly locked = this.props.value !== undefined && this.props.value !== null && this.props.value !== "";

  render() {
    const { value, forID, className, onChange } = this.props;
    return <div>
      <input id={forID} className={className} type="number" min={1} step={1} value={typeof value === "number" || typeof value === "string" ? value : ""} readOnly={this.locked}
        onChange={event => { if (!this.locked) onChange(event.target.value === "" ? undefined : Number(event.target.value)); }} />
      <p>{this.locked ? "Existing event IDs are locked to preserve URLs and references." : "Choose an unused positive integer for this new event. The ID is locked after reload."}</p>
    </div>;
  }
}
