import { Link } from "react-router-dom";

const Header = () => {

  const styling  = {  
    padding: "1em" 
  }

  return (    
    <div>
        <Link style = {styling} to="/authors"> Authors </Link>
        <Link style = {styling} to="/books"> Books </Link>
        <Link style = {styling}  to="/add"> Add book </Link>
    </div>  
  );
};

export default Header;