import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
import App from './components/App';
// import * as serviceWorker from './serviceWorker';

//1 Assorted Imports.
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory' //Ours would replace this

//2: Needs to know the _endpoint_ of your graphQL API (GraphQL server?) so it can deal with network connections.
const httpLink = createHttpLink({
  uri: 'http://localhost:4000'
});

//3: Create the client with our httpLink and our cache (this is where we'd drop in our future cache!)
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

//4 : Wrap your App component in the ApolloProvider higher-order component (with client passed into props)
// Higher Order Components are components that modify the behavior of the components that are nested in them?
ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
// serviceWorker.unregister();