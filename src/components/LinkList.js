import React, { Component } from 'react';
import Link from './Link'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

export const FEED_QUERY = gql`
  {
    feed {
      links {
        id
        createdAt
        url
        description
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

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
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
`
const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      id
      link {
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
      user {
        id
      }
    }
  }
`



class LinkList extends Component {


  _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: FEED_QUERY })

    const votedLink = data.feed.links.find(link => link.id === linkId)
    votedLink.vote = createVote.link.votes

    store.writeQuery({ query: FEED_QUERY, data })
  }

  _subscribeToNewVotes = subscribeToMore => {
    subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION
    })
  }

  _subscribeToNewLinks = subscribeToMore => {
    /**
     * Explanation:
     * document: This represents the subscription query itself. In your case, the subscription will fire every time a new link is  created.
     * updateQuery: Similar to a cache update prop, this function allows you to determine how the store should be updated with the information that was sent by the server after the event occured. In fact, it follows exactly teh same principles as a Redux reducer: It takes as arguments the previous state (of the query that subscribeToMore was called on)... and the subscription data that's sent by the server. You can then determine how to merge the subscription data into the existing state and return the updated data. All you're doing inside updateQuery is retrieving the new link from the received subscriptionData, merging it into the existing list of links and returning the result of this operation.
     */
    subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev
        const newLink = subscriptionData.data.newLink
        const exists = prev.feed.links.find(({ id }) => id === newLink.id);
        if (exists) return prev;

        return Object.assign({}, prev, {
          feed: {
            links: [newLink, ...prev.feed.links],
            count: prev.feed.links.length + 1,
            __typename: prev.feed.__typename
          }
        })
      }
    })
  }

  render() {


    /**
     * You start by reading the current state of the cached data for the FEED_QUERY from the store
     * Now you're retrieving the links that the user just voted for from the list. You're also manipulating that link by resetting its votes to the votes that were returned by the server.
     * Finally, you take the modified data and write it back into the store
     */



    // Render a list of Link components, passing in the appropriate props to each one
    return (
      <Query query={FEED_QUERY}>
        {({ loading, error, data, subscribeToMore }) => {
          if (loading) return <div>Fetching</div>
          if (error) { return <div>Error</div> }
          // Success!

          this._subscribeToNewLinks(subscribeToMore)
          this._subscribeToNewVotes(subscribeToMore)
          const linksToRender = data.feed.links //the array of links returned form the query

          return (
            <div>
              {linksToRender.map((link, index) => (
                <Link key={link.id} link={link} index={index} updateStoreAfterVote={this._updateCacheAfterVote} />
              ))}
            </div>
          )
        }}
      </Query>
    )
  }
}

export default LinkList;