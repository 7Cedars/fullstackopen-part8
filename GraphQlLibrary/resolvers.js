const { GraphQLError } = require('graphql')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

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
    if (args.genreToSearch === "all" || !args.genreToSearch) { 
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
    // NB: note that I only make one additional server query to resolve all bookCounts. 
    // It is not the most beautiful solution (and it's quiet slow) but works.  
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

      // console.log("currentUser at addBook: ", currentUser)

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
      if (!newAuthor) {
        const author = new Author({ name: args.author })
        await author.save()
      }

      newAuthor = await Author.findOne({ name: args.author })
      let book = new Book({...args})
      book.author = newAuthor

      try {
        await book.save()
      } catch (error) {
          throw new GraphQLError('Saving book failed.', {
            extensions: {
              code: 'BAD_USER_INPUT',
              invalidArgs: [args.author, args.title],
              error
            }
          })
       }

       pubsub.publish('BOOK_ADDED', { bookAdded: book })

       return book 

    },     
    editAuthor: async (root, args, { currentUser } ) => {

      // console.log("currentUser at editAuthor: ", currentUser)

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

      // console.log("LOGGING IN AS: ", userForToken.username )
  
      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) }
    }
  }, 
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator('BOOK_ADDED')
    },
  },
}

module.exports = resolvers