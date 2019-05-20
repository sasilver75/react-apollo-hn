import React, { Component } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import Link from './Link'

const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
        id
        url
        description
        createdAt
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`



class Search extends Component {
  state = {
    links: [],
    filter: '',
  }

  // Execute the FEED_SEARCH_QUERY manually and retrieve the links from the response thats returned by the server. Then these links are put into the component's state so that they can be rendered.
  _executeSearch = async () => {
    const { filter } = this.state;
    // The withApollo function injects the Apollo Client instance into the Search component as a new prop called client. The client has a method called query which you can use to send a query manually instead of using higher-order components like Query or Mutation.
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter }
    })
    const links = result.data.feed.links;
    this.setState({ links });
  }

  render() {
    return (
      <div>
        <div>
          Search
          <input
            type='text'
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>
        {this.state.links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    )
  }



}


// Note: withApollo is a simple enhancer which provides direct access to your ApolloClient instance. withApollo creates a new component which passes in an instance of ApolloClient as a client prop. This will only be able to provide access to your client if there is an ApolloProvider component higher up in your tree to actually provide the client.
// AGAIN: The purpose of the withApollo function is that when wrapped around a component, it injects the ApolloClient instance into the component's props.
export default withApollo(Search);