import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import Recommend from './components/Recommend'
import { gql, useQuery, useApolloClient } from '@apollo/client'

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
      author {name}
      id
      genres
    }
  }
`

const ME = gql`
  query {
    me {
      favoriteGenre
    }
  }
`

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)

  const res_auth = useQuery(ALL_AUTHORS, { pollInterval: 2000 })
  const res_book = useQuery(ALL_BOOKS, { pollInterval: 2000 })
  const res_me = useQuery(ME, {pollInterval: 2000})

  const client = useApolloClient()

  if ( res_auth.loading || res_book.loading) {
    return <div>loading...</div>
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={() => setPage('recommend')}>recommend</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      <Authors show={page === 'authors'} authors={res_auth.data.allAuthors} token={token} />

      <Books show={page === 'books'} books={res_book.data.allBooks}/>

      {page === 'add' && token && <NewBook show={page === 'add'} token={token} />}
      {page === 'recommend' && token && 
        <Recommend show={page === 'recommend'} token={token} books={res_book.data.allBooks} favoriteGenre={res_me.data.me.favoriteGenre}/>}
      {page === 'login' && (
        <LoginForm setToken={setToken} setPage={setPage}/> )}
    </div>
  )
}

export default App
