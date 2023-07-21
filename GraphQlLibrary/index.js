const { ApolloServer } = require('@apollo/server')
const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const { startStandaloneServer } = require('@apollo/server/standalone')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

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

type User {
  username: String!
  favoriteGenre: String!
  id: ID!
}

type Token {
  value: String!
}

type Query {
  bookCount: Int!
  authorCount: Int!
  allBooks(author: String, genreToSearch: String): [Book]!
  allAuthors: [Author!]!
  me: User
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
  createUser(
    username: String!
    favoriteGenre: String!
  ): User
  login(
    username: String!
    password: String!
  ): Token
} 
`

const resolvers = {
  Query: {
   me: (root, args, { currentUser } ) => {
   // console.log(context)
    console.log("currentUser at me: ", currentUser)

    return currentUser
   },
   bookCount: async () => Book.collection.countDocuments(),
   authorCount: async () => Author.collection.countDocuments(),
   allBooks: async (root, args) => {
    // I think this could have been coded more concise, but it works.. 
    booksList = await Book.find({}).populate('author')
      if (args.genreToSearch === "all") { 
        return booksList 
      } else {
        return Book.find({genres: args.genreToSearch}).populate('author')
      }
      // if (args.author) { 
      //   return booksList.filter(book => book.author.name === args.author )
      // }
    },
   allAuthors: async (root, args) => {
    // filters missing
      return Author.find({})
    },
  }, 
  Author: {
    bookCount: async (root) => { 
      let countAuthor = 0
      const books = await Book.find({}).populate('author')
      // console.log(books)
      books.map(book => {
        if (root.name === book.author.name) countAuthor++ 
      })
      return countAuthor
  }},
  Mutation: {
    addBook: async (root, args, { currentUser } ) => {

      console.log("currentUser at addBook: ", currentUser)

      if (!currentUser ) {
        throw new GraphQLError('Not Authorized', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      } 

      if (args.author.length < 5 || args.title.length < 6 ) {
        throw new GraphQLError('Title and/or author name too short.', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }

      let newAuthor = await Author.findOne({ name: args.author })
      console.log("newAuthor:" , newAuthor)
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
    editAuthor: async (root, args, { currentUser } ) => {

      console.log("currentUser at editAuthor: ", currentUser)

      if (!currentUser ) {
        throw new GraphQLError('Not Authorized', {
          extensions: { code: 'BAD_USER_INPUT' }
        })
      }   

      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      return author.save()
    },
    createUser: async (root, args) => {
      const user = new User({ ...args })
  
      return user.save()
        .catch(error => {
          throw new GraphQLError('Creating user profile failed', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: [args.username, args.favoriteGenre],
              error
            }
          })
        })
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
  
      if ( !user || args.password !== 'secret' ) {
        throw new GraphQLError('wrong credentials', {
          extensions: {
            code: 'BAD_USER_INPUT'
          }
        })        
      }
  
      const userForToken = {
        username: user.username,
        id: user._id,
      }

      console.log("LOGGING IN AS: ", userForToken.username )
  
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.startsWith('Bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), process.env.JWT_SECRET
      )
      const currentUser = await User
        .findById(decodedToken.id)
      return { currentUser }
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`)
})