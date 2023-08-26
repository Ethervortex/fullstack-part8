const Recommend = ({ show, favoriteGenre, books }) => {
  if (!show) {
    return null
  }

  const recommendedBooks = books.filter(book => book.genres.includes(favoriteGenre))

  return (
    <div>
      <h2>recommendations</h2>
      <p>books in your favorite genre: {favoriteGenre}</p>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.map((book) => (
            <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommend