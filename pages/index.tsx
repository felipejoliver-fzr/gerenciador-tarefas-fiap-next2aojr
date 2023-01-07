import { useEffect, useState } from 'react';
import { Home } from '../containers/Home';
import { Login } from '../containers/Login'

export default function Index() {
  const [accessToken, setAccessToken] = useState('');

  useEffect(() => {
    if(window !== undefined){
      const token = localStorage.getItem('accessToken');
      if(token){
        setAccessToken(token);
      }
    }
  }, []);

  return !accessToken ? <Login setToken={setAccessToken}/> : <Home setToken={setAccessToken}/>;
}
