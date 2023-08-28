import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import { updateCache, ALL_BOOKS } from '../App'

//author: {name} lisätty
const ADD_BOOK = gql`
  mutation newBook($title: String!, $published: Int!, $author: String!, $genres: [String!]!) {
    addBook(title: $title, published: $published, author: $author, genres: $genres) {
      title
      author {name}
      published
      genres
    }
  }
`
const BOOK_DETAILS = gql`
  fragment BookDetails on Book {
    id
    title
    author {name}
    published
    genres
  }
`
export const BOOK_ADDED = gql`
  subscription {
    bookAdded {
      ...BookDetails
    }
  }
  ${BOOK_DETAILS}
`

const NewBook = ( props ) => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const { token } = props

  const [ newBook ] = useMutation(ADD_BOOK, {
    context: {
      headers: {
        authorization: token ? `Bearer ${token}` : '',
      },
    },
    
    update: (cache, response) => {
      updateCache(cache, { query: ALL_BOOKS }, response.data.addBook)
    },
  }) 

  //console.log("props.show:", props.show)
  if (!props.show) {
    return null
  }

  const submit = async (event) => {
    event.preventDefault()
    console.log('Token:', token)

    const publishedInt = !isNaN(published) ? parseInt(published) : null
    console.log('Variables:', typeof title, typeof publishedInt, typeof author, Array.isArray(genres))
    

    newBook({ variables: { title, published:publishedInt, author, genres }})

    console.log('add book...')

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(target.value)}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook