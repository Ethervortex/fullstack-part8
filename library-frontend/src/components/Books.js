import { useState } from 'react'

const Books = (props) => {
  const [selectedGenre, setSelectedGenre] = useState('all')

  if (!props.show) {
    return null
  }

  const books = props.books || []

  const allGenres = [...new Set(books.flatMap(book => book.genres))]

  const handleGenreFilter = (genre) => {
    setSelectedGenre(genre)
  }

  const filterBooks = selectedGenre === 'all'
    ? books
    : books.filter(book => book.genres.includes(selectedGenre))

  return (
    <div>
      <h2>books</h2>
      <p>in genre {selectedGenre}</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filterBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {allGenres.map(genre => (
          <button key={genre} onClick={() => handleGenreFilter(genre)}>
            {genre}
          </button>
        ))}
        <button onClick={() => handleGenreFilter('all')}>all genres</button>
      </div>
    </div>
  )
}

export default Books
