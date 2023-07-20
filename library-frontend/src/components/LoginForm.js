import { useState, useEffect} from "react";
import { useMutation } from '@apollo/client'
import { LOGIN } from './queries'

const LoginForm = ({ setToken }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [ login, result ] = useMutation(LOGIN)
  
  useEffect(() => {
    if ( result.data ) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('phonenumbers-user-token', token)
      console.log("TOKEN TRANSFERRED TO localStorage")
    }
  }, [result.data]) // eslint-disable-line

  const handleLogin = async (event) => {
    event.preventDefault();
    
    const result = await login({ variables: {username, password}})
    console.log("TOKEN LOGIN: ", result.data.login.value)

    setUsername("")
    setPassword("")
  }


  return (
    <form
      onSubmit={handleLogin}
    >
      <div>
        <input
          type="text"
          placeholder="Username"
          value={username}
          id="username"
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div>
        <input
          value={password}
          placeholder="Password"
          id="password"
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button
        type="submit"
        id="login-button"
        className="font-medium text-white/[.8] px-5 hover:text-white sm:py-6"
      >
        login
      </button>
    </form>
  );
};

export default LoginForm;