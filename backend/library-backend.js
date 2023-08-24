const { ApolloServer } = require('@apollo/server')
const { startStandaloneServer } = require('@apollo/server/standalone')
const { v1: uuid } = require('uuid')
const { GraphQLError } = require('graphql')

const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Book = require('./models/book')
const Author = require('./models/author')
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


let authors = [
  {
    name: 'Robert Martin',
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    born: 1952,
  },
  {
    name: 'Martin Fowler',
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    born: 1963
  },
  {
    name: 'Fyodor Dostoevsky',
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    born: 1821
  },
  { 
    name: 'Joshua Kerievsky', // birthyear not known
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
  },
  { 
    name: 'Sandi Metz', // birthyear not known
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
  },
]

let books = [
  {
    title: 'Clean Code',
    published: 2008,
    author: 'Robert Martin',
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Agile software development',
    published: 2002,
    author: 'Robert Martin',
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ['agile', 'patterns', 'design']
  },
  {
    title: 'Refactoring, edition 2',
    published: 2018,
    author: 'Martin Fowler',
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring']
  },
  {
    title: 'Refactoring to patterns',
    published: 2008,
    author: 'Joshua Kerievsky',
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'patterns']
  },  
  {
    title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
    published: 2012,
    author: 'Sandi Metz',
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ['refactoring', 'design']
  },
  {
    title: 'Crime and punishment',
    published: 1866,
    author: 'Fyodor Dostoevsky',
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'crime']
  },
  {
    title: 'The Demon ',
    published: 1872,
    author: 'Fyodor Dostoevsky',
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ['classic', 'revolution']
  },
]

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    id: ID!
    born: Int
    bookCount: Int!
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
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
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
    /* bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let filtered = books
      if (args.author) {
        filtered = filtered.filter(book => book.author === args.author)
      }

      if (args.genre) {
        filtered = filtered.filter(book => book.genres.includes(args.genre))
      }
      return filtered
    },
    allAuthors: () => {
      return authors.map(author => ({
        name: author.name,
        born: author.born,
        id: author.id,
        bookCount: books.filter(book => book.author === author.name).length
      }))
    }, */
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let query = Book.find({})
      
      if (args.author) {
        const authorFromMongo = await Author.findOne({ name: args.author });
        if (!authorFromMongo) {
          return []
        }
        query = query.where('author', authorFromMongo._id)
      }
    
      if (args.genre) {
        query = query.where('genres').in([args.genre])
      }
      
      return query.populate('author')
    },
    allAuthors: async () => {
      const authorsFromMongo = await Author.find({})
      console.log(authorsFromMongo)
      const authorPromises = authorsFromMongo.map(async author => {
        const bookCount = await Book.countDocuments({ author: author._id })
        return {
          name: author.name,
          born: author.born,
          id: author.id,
          bookCount: bookCount
        }
      })
      return Promise.all(authorPromises)
    }
  },
  Mutation: {
    /* addBook: (root, args) => {
      let author = authors.find(author => author.name === args.author)

      if (!author) {
        author = {
          name: args.author,
          id: uuid()
        }
        authors = authors.concat(author)
      }

      const book = { ...args, id: uuid() }
      books = books.concat(book)
      return book
    }, 
    editAuthor: (root, args) => {
      let author = authors.find(author => author.name === args.name)

      if (!author) return null
      author.born = args.setBornTo
      
      return author
    }, */
    addBook: async (root, args) => {
      let authorFromMongo = await Author.findOne({ name: args.author})
      if (!authorFromMongo) {
        console.log('Kirjailijaa ei löydy tietokannasta, lisätään...')
        authorFromMongo = new Author({ name: args.author })
        await authorFromMongo.save()
      } 

      const book = new Book({
        title: args.title,
        published: args.published,
        author: authorFromMongo._id,
        genres: args.genres
      })
      return book.save()
    },
    editAuthor: async (root, args) => {
      let authorFromMongo = await Author.findOne({ name: args.name })
      if (!authorFromMongo) return null
      authorFromMongo.born = args.setBornTo
      return authorFromMongo.save()
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
