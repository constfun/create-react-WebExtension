// https://www.typescriptlang.org/docs/handbook/jsx.html

// React types are included from @types/react
import * as React from 'react';
// react-scripts-webextension include type definitions.
import { ReadmeSearch } from 'react-scripts-webextension';
import PoweredBy from './PoweredBy';
 
interface SearchState {
  query: string;
}

export default class Search extends React.Component<object, SearchState> {
  constructor() {
    super();
    this.state = { query: '' };
  }

  search = (event : React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ query: event.currentTarget.value });
  }

  render() {
    return (
      <div className="Search">
        <div className="bar">
          <input
            type="search"
            placeholder="Search the User Guide"
            value={this.state.query}
            onChange={this.search}
          />
          <PoweredBy what={`TypeScript ${String.fromCodePoint(0x01F4A7)}`} />
        </div>
        <ReadmeSearch query={this.state.query} />
      </div>
    );
  }
}