const {
  GraphQLServer
} = require('graphql-yoga')
const {
  prisma
} = require('./generated/prisma-client')
const Query = require('./resolvers/Query')
const Mutation = require('./resolvers/Mutation')
const Subscription = require('./resolvers/Subscription')
const User = require('./resolvers/User')
const Link = require('./resolvers/Link')
const Vote = require('./resolvers/Vote')

const resolvers = {
  Query,
  Mutation,
  Subscription,
  User,
  Link,
  Vote,
}

// Give the Schema and your Resolvers ...and your Context to create the GraphQL Server
// Using GraphQL Yoga, which has sort of been... deprecated and merged with Apollo 2.0
const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: request => ({
    ...request,
    prisma,
  }),
})

server.start(() => console.log(`Server is running on http://localhost:4000`))