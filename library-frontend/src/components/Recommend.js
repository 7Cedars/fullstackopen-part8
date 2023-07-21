import { useQuery } from '@apollo/client'
import { ALL_BOOKS } from './queries'

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

const Recommend = ( {userData} ) => {

  const favGenre = userData.me.favoriteGenre 

  const result = useQuery(ALL_BOOKS, {
    variables: { genreToSearch: favGenre}
  })
  console.log(result)

  if (result.data) {
    const allBooks = result.data.allBooks
    
    return (
      <div>
        <h2>books</h2>
        <div> in genre, <b> {favGenre} </b> </div>
          <BookList books = { allBooks } /> 
      </div>
    )
  }
}

export default Recommend
