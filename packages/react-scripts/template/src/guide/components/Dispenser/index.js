import * as React from 'react';

export default function(props) {
  const flavorDivs = props.flavors.reduce((divs, fl) => {
    if (fl.isAvailable) {
      divs.push(
        <div key={fl.name} className="flavor">
          Press {String.fromCharCode(65 + divs.length)} to run {fl.human} from{' '}
          <code>src/{fl.name}</code>
        </div>
      );
    }
    return divs;
  }, []);

  return (
    <div className="Dispenser">
      {flavorDivs}
    </div>
  );
}
