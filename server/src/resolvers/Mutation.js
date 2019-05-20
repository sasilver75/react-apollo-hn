const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {
  APP_SECRET,
  getUserId
} = require('../utils')

// # With this, you're extracting hte userID from the Authorization header of the request and use it to directly connect it with the Link that's created. Note that getUserId will throw an error if the field is not provided or not valid token could be extracted
// # Quiz: How are HTTP requests sent by ApolloClient authenticated? A: By attaching an authentication token to the request with dedicated ApolloLink middleware
function post(parent, {
  url,
  description
}, context) {
  const userId = getUserId(context)
  return context.prisma.createLink({
    url,
    description,
    postedBy: {
      connect: {
        id: userId
      }
    }
  })
}

async function signup(parent, args, context) {
  const password = await bcrypt.hash(args.password, 10)
  const user = await context.prisma.createUser({
    ...args,
    password
  })

  const token = jwt.sign({
    userId: user.id
  }, APP_SECRET)

  return {
    token,
    user,
  }
}

async function login(parent, args, context) {
  const user = await context.prisma.user({
    email: args.email
  })
  if (!user) {
    throw new Error('No such user found')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Invalid password')
  }

  return {
    token: jwt.sign({
      userId: user.id
    }, APP_SECRET),
    user,
  }
}

async function vote(parent, args, context) {
  const userId = getUserId(context)
  const linkExists = await context.prisma.$exists.vote({
    user: {
      id: userId
    },
    link: {
      id: args.linkId
    },
  })
  if (linkExists) {
    throw new Error(`Already voted for link: ${args.linkId}`)
  }

  return context.prisma.createVote({
    user: {
      connect: {
        id: userId
      }
    },
    link: {
      connect: {
        id: args.linkId
      }
    },
  })
}

module.exports = {
  post,
  signup,
  login,
  vote,
}