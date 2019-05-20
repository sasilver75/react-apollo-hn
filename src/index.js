import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
import { BrowserRouter } from 'react-router-dom';
import { setContext } from 'apollo-link-context'
import { AUTH_TOKEN } from './constants'
import { split } from 'apollo-link'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'


// import * as serviceWorker from './serviceWorker';

/**
 * Index.js is where we configure our Apollo Client, among other things.
 * To start this app, run "prisma deploy" in the server directory, run "npm start" in the server dir, and run "npm start" in the main dir
 */


//1 Assorted Imports.
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory' //Ours would replace this

//2: Needs to know the _endpoint_ of your graphQL API (GraphQL server?) so it can deal with network connections.
const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
});

// 2.5: Using Apollo Link for authentication middleware. This middleware will be invoked every time ApolloClient sends a request ot the server. Apolli Links allow you to create middlewares that modify requests before they are sent to a server. 
// Let's see how it works in our code: first, we get the authentication token from localStorage if it exists; after that, we return the headers to the context so httpLink can read them.
// That’s it - now all your API requests will be authenticated if a token is available.
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ''
    }
  }
})

// 2.5.2 Create a new WebSocketLink that represents the the WebSocket connection. 
// Use split for proper "routing" of the requests and updating the constructor call of ApolloClient like so:
// @Alyvia: We're adding both an httplink and a wslink to our Network Interface portion of the ApolloClient... The split is a tool that routes the appropriate graphql... operations? to the appropriate link in the netowrk interface portion
// You're instantiating a WebSocketLink that knows the subscriptions endpoint. The subscriptions endpoint in this case is similar to the HTTP endpoint, except that it uses the ws instead of the http protocol. Notice that you're also authenticating the websocket connection with he user's token that you retreive from localStorage... 
/**
 * Split is used to "route" a request to aspecific middleware link! It takes three arguemnts:
 *  1. test function which returns a boolean
 *  2. The remaining two arguments s are of type ApolloLink. If test returns true, the request will be forwarded to the link passed as the second argument. If flase, to the third one.
 * In our case, the test is checking whether the requested operation is a SUBSCRIPTION. If this is the case, it will be forwarded to the wsLink, otherwise it's a query/mutation and will be forwarded to the authLink.concat(httpLink)
 */
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000',
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN),
    }
  }
})

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query)
    return kind === 'OperationDefinition' && operation === 'subscription'
  },
  wsLink,
  authLink.concat(httpLink)
)


//3: Create the client with our httpLink and our cache (this is where we'd drop in our future cache!)
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

//4 : Wrap your App component in the ApolloProvider higher-order component (with client passed into props)
// Higher Order Components are components that modify the behavior of the components that are nested in them?
ReactDOM.render(
  <BrowserRouter>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </BrowserRouter>,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();