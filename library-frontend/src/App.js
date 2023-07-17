import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Header from "./components/Header";
import EditAuthor from "./components/EditAuthor";

const App = () => {  

  return (
    
      <Router>
        <Header/>
        <Routes>
            <Route path="/" element={<Authors />} />
            <Route path="/authors" element={<Authors />} />
            <Route path="/books" element={<Books />} />
            <Route path="/add" element={<NewBook />} />
            <Route path="/edit" element={<EditAuthor />} />
          </Routes>
      </Router>
    
  )
}

export default App
