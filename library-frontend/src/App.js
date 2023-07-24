import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Header from "./components/Header";
import EditAuthor from "./components/EditAuthor";
import LoginForm from "./components/LoginForm";
import Recommend from "./components/Recommend";
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import { useState, useEffect } from "react";
import { ME, BOOK_ADDED, ALL_BOOKS } from './components/queries'

const App = () => {  
  const client = useApolloClient()
  const [token, setToken] = useState(null)
  const [userData, setUserData] = useState(null)
  const { data } = useQuery(ME)

  useEffect(() => {
    const storedToken = localStorage.getItem('phonenumbers-user-token', token)
    setToken(storedToken)
  }, [])

  useEffect(() => {
    if ( data ) {setUserData(data)} 
  }, [data])

  // console.log("token at App: ", token)
  // console.log("userdata at App: ", userData)

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      // console.log("SUBSCRIPTION DATA: ", data)
      const addedBook = data.data.bookAdded
      alert(`${addedBook.title}, by ${addedBook.author.name}, has been added to the library.`)

      client.cache.updateQuery({ query: ALL_BOOKS, variables: {genreToSearch: 'all'} }, ( {allBooks} ) => {
        console.log("DATA at updateQuery :", data)
        return {
          allBooks: allBooks.concat(addedBook),
        }
      })

    }
  })

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }

  return (
    
      <Router>
        <Header token={token} logout={logout}/>
        <Routes>
            <Route path="/" element={<Authors />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/books" element={<Books />} />
            <Route path="/recommend" element={token ? <Recommend userData = {userData} /> : <Navigate replace to="/login" />} />
            <Route path="/add" element={token ? <NewBook /> : <Navigate replace to="/login" />} />
            <Route path="/edit" element={token ? <EditAuthor /> : <Navigate replace to="/login" />} />
            <Route path="/login" element={ <LoginForm setToken={setToken} /> } />
          </Routes>
      </Router>
    
  )
}

export default App
