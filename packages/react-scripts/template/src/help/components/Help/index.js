import * as React from 'react';
import checkFeature from '@app/check-feature';
import Step0 from '../Step0';
import Step1 from '../Step1';

export default function() {
  const atLeastOneFeatureIsEnabled =
    ['js-flavor', 'typescript-flavor', 'ocaml-flavor', 'reasonml-flavor']
      .map(checkFeature)
      .filter(yesno => yesno).length > 0;

  return atLeastOneFeatureIsEnabled ? <Step1 /> : <Step0 />;
}
