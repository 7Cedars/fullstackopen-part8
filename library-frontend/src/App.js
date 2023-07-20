import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Header from "./components/Header";
import EditAuthor from "./components/EditAuthor";
import LoginForm from "./components/LoginForm";
import { useApolloClient } from '@apollo/client'
import { useState } from "react";

const App = () => {  

  const [token, setToken] = useState(null)
  const client = useApolloClient()

  console.log("token at App: ", token)

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
            <Route path="/add" element={<NewBook />} />
            <Route path="/edit" element={<EditAuthor />} />
            <Route path="/login" element={ <LoginForm setToken={setToken} /> } />
          </Routes>
      </Router>
    
  )
}

export default App
