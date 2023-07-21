import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_AUTHORS } from './queries'
import { useState, useEffect } from "react";

const BookList = ({ books }) => {
  // console.log("books: ", books)
  if (books !== null) {
    return (
      <table>
          <tbody>
            <tr>
              <th></th>
              <th>author</th>
              <th>published</th>
            </tr>
        { books.map(book => 
          <tr key={book.title}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
        )}
        </tbody>
      </table>
    )
  }
}

const Books = () => {
  const [genreToSearch, setGenreToSearch] = useState("all")
  const [savedGenres, SetSavedGenres] = useState([])
  const result = useQuery(ALL_BOOKS, {
    variables: { genreToSearch }
  })

  if (result.data) {
    const allBooks = result.data.allBooks
    if (savedGenres.length === 0) {
      let allBookGenres = [].concat(...allBooks).map(({ genres }) =>  genres)
      // https://stackoverflow.com/questions/49860572/how-to-extract-property-of-array-in-nested-array
      allBookGenres = Array.from(new Set( allBookGenres.flat()))
      SetSavedGenres(allBookGenres)
    }
    
    return (
      <div>
        <h2>books</h2>
        {genreToSearch === 'all' ? 
            null : <div> in genre, <b> {genreToSearch} </b> </div>
          } 
          <BookList books = { allBooks } /> 
            {savedGenres.map((genre) => (
              <button key = {genre} onClick={() => setGenreToSearch(genre)} > {genre} </button>
            ))
          }
      </div>
    )
  }
}

export default Books
