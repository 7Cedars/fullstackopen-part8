import { Link } from "react-router-dom";

const Header = ( {token, logout} ) => {

  // console.log("token at Header: ", token)

  const styling  = {  
    padding: "1em" 
  }

  return (    
    <div>
        <Link style = {styling} to="/authors"> Authors </Link>
        <Link style = {styling} to="/books"> Books </Link>        
        { (token === null) ? 
          <Link style = {styling}  to="/login"> Login </Link>
          : 
          <>
            <Link style = {styling}  to="/recommend"> Recommendations </Link>
            <Link style = {styling}  to="/add"> Add book </Link>
            <Link style = {styling}  to="/edit"> Edit author </Link>
            <button onClick={logout}>logout</button>
          </> 
        }
    </div>  
  );
};

export default Header;