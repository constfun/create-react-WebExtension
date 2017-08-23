import * as React from 'react';
import { ReadmeSearch } from 'react-scripts-webextension';
import './Search.css';

interface SearchState {
  query: string;
}

export default class Search extends React.Component<object, SearchState> {
  constructor() {
    super();
    this.state = {
      query: ''
    };
  }

  handleChange = (event : React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({
      query: event.currentTarget.value
    });
  }

  render() {
    return (
      <div className="Search">
        <div className="bar">
          <input
            type="search"
            placeholder="Search the User Guide"
            value={this.state.query}
            onChange={this.handleChange}
          />
        </div>
        <ReadmeSearch query={this.state.query} />
      </div>
    );
  }
}