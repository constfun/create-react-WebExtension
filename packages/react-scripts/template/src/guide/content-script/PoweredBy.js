import * as React from 'react';

export default function PoweredBy(props) {
  return (
    <div className="PoweredBy">
      Powered by {props.text}
      <span>{String.fromCodePoint(props.emoji)}</span>
    </div>
  );
}