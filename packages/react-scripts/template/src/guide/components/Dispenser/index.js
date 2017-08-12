import * as React from 'react';

export default function(props) {
  const flavorDivs = props.flavors.map((fl, indx) => {
    const classes = ['flavor'];
    if (fl.isAvailable) classes.push('is-available');
    const content = fl.isAvailable
      ? <span>
          Press {String.fromCharCode(65 + indx)} for {fl.human}.
        </span>
      : <span>
          Run <code>npm inject {fl.name}</code> for {fl.human} example.
        </span>;
    return (
      <div key={fl.name} className={classes}>
        {content}
      </div>
    );
  });

  return (
    <div className="Dispenser">
      {flavorDivs}
    </div>
  );
}
