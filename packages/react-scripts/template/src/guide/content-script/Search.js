import * as React from 'react';
import PoweredBy from './PoweredBy';
import { ReadmeSearch } from 'react-scripts-webextension';

export default class Search extends React.Component {
  constructor() {
    super();
    this.state = { query: '' };
  }

  search = (event) => {
    this.setState({ query: event.target.value });
  }

  render() {
    return (
      <div className="Search">
        <div className="bar">
          <input
            type="search"
            placeholder="Search the User Guide"
            value={this.query}
            onChange={this.search}
          />
          <PoweredBy text="JavaScript" emoji={0x01F525} />
        </div>
        <ReadmeSearch query={this.state.query} />
      </div>
    );
  }
}