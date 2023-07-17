import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { EDIT_AUTHOR, ALL_BOOKS, ALL_AUTHORS } from './queries'

const NewBook = () => {
  const [name, setName] = useState('')
  const [setBornTo, setSetBornTo] = useState(2000) 

  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS } ]
  })

  const submit = async (event) => {
    event.preventDefault()

    editAuthor({  variables: { name, setBornTo } })
    console.log('edit author: name = ', name, 'setBornTo = ', setBornTo)

    setName('')
    setSetBornTo(0)
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born
          <input
            type="number"
            value={setBornTo}
            onChange={({ target }) => setSetBornTo(parseInt(target.value))}
          />
        </div>
        <button type="submit">Update author</button>
      </form>
    </div>
  )
}

export default NewBook