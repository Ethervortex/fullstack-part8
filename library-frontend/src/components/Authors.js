import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import Select from 'react-select'

const EDIT_YEAR = gql`
  mutation newYear($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

const Authors = (props) => {
  //const [name, setName] = useState('') // poistettu tehtävässä 8.12
  const [setBornTo, setBorn] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState(null)

  const [ newYear ] = useMutation(EDIT_YEAR)

  if (!props.show) {
    return null
  }
  const authors = props.authors || []

  const handleAuthorSel = (selectedOption) => {
    setSelectedAuthor(selectedOption);
  }

  const submit = async (event) => {
    event.preventDefault()

    if (selectedAuthor) {
      newYear({ variables: { name: selectedAuthor.value, setBornTo: parseInt(setBornTo) } })

      console.log('edit year...')

      setSelectedAuthor(null)
      setBorn('');
    }
  }

  const authorOps = authors.map((author) => ({
    value: author.name,
    label: author.name,
  }))

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {props.token && (
      <>
      <h2>set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          <Select
            value={selectedAuthor}
            onChange={handleAuthorSel}
            options={authorOps}
            placeholder="Select author"
          />
        </div>
        <div>
          born
          <input
            value={setBornTo}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        
        <button type="submit">update author</button>
      </form>
      </>
      )}
    </div>
  )
}

export default Authors
