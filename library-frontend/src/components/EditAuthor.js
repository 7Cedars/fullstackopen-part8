import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import Select from 'react-select';
import { EDIT_AUTHOR, ALL_BOOKS, ALL_AUTHORS, ME } from './queries'

const EditAuthor = () => {
  const [ selectedName, setSelectedName ] = useState({label: "none", value: "none"})
  const [ setBornTo, setSetBornTo ] = useState(1850) 
  const [ editAuthor ] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [ { query: ALL_AUTHORS }, { query: ALL_BOOKS } ]
  })
  const user = useQuery(ME)
  console.log("USER: ", user)

  const result = useQuery(ALL_AUTHORS)
  if (result.loading) {
    return <div>loading</div>
  }
  const options = result.data.allAuthors.map((a) => (
    {label: a.name, value: a.name}
  ))

  const submit = async (event) => {
    event.preventDefault()

    const name = selectedName.value
    editAuthor({  variables: { name, setBornTo } })
    console.log('edit author:  ', { name, setBornTo })
    setSelectedName({label: "none", value: "none"})
    setSetBornTo(1850)
  }

  return (
    <div>
      <h2>Set birthyear</h2>
      <form onSubmit={submit}>
        <div>
          name
          <Select
            defaultValue={selectedName}
            onChange={setSelectedName}
            options={options}
          />
          {/* <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          /> */}
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

export default EditAuthor