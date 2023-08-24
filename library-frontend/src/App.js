import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery } from '@apollo/client'

const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      id
      bookCount
    }
  }
`

const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      published
      author
      id
      genres
    }
  }
`

const App = () => {
  const [page, setPage] = useState('authors')

  const res_auth = useQuery(ALL_AUTHORS, { pollInterval: 2000 })
  const res_book = useQuery(ALL_BOOKS, { pollInterval: 2000 })

  if ( res_auth.loading || res_book.loading) {
    return <div>loading...</div>
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
      </div>

      <Authors show={page === 'authors'} authors={res_auth.data.allAuthors} />

      <Books show={page === 'books'} books={res_book.data.allBooks} />

      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
