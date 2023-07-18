const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

const typeDefs = `
type Book {
  title: String!
  published: Int!
  author: Author!
  genres: [String!]!
  id: ID!
}

type Author {
  name: String!
  born: String
  bookCount: Int
  id: ID!
}

type Query {
  bookCount: Int!
  authorCount: Int!
  allBooks(author: String, genre: String): [Book]!
  allAuthors: [Author!]!
}

type Mutation {
  addBook(
    title: String!
    author: String!
    published: Int!
    genres: [String!]! 
  ): Book  
  editAuthor(
    name: String!
    setBornTo: Int!
  ): Author 
} 
`

const resolvers = {
  Query: {
   bookCount: async () => Book.collection.countDocuments(),
   authorCount: async () => Author.collection.countDocuments(),
   allBooks: async (root, args) => {
    // filters missing
      return Book.find({})
    },
   allAuthors: async (root, args) => {
    // filters missing
      return Author.find({})
    },
  }, 
  Author: {
    bookCount: (root) => { 
      let countAuthor = 0
      // Book.map(book => {
      //   if (root.name === book.author) countAuthor++ 
      // })
      return countAuthor
  }},
  Mutation: {
    addBook: async (root, args) => {

      if (args.author.length < 5 || args.title.length < 6 ) {
        throw new GraphQLError('Title and/or author name too short.', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      let newAuthor = await Author.findOne({ name: args.author })
      if (!newAuthor) {
        const author = new Author({ name: args.author })
        await author.save()
      }
      newAuthor = await Author.findOne({ name: args.author })
      let book = new Book({...args})
      book.author = newAuthor
      return book.save()
        .catch(error => {
          throw new GraphQLError('Saving book failed.', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: [args.author, args.title],
              error
            }
          })
       })
    }, 
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      return author.save()
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})