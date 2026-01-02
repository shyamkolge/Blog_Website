import AuthContext from "./AuthContext";
import { useEffect, useState } from "react";
import {loginAPI , logoutAPI, signupAPI, getMeApi } from '../../api/auth.api'

const AuthProvider = ({ children }) => {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔁 Persistent Login
  useEffect(()=>{
    const fetchUser = async () => {
      try {
        const data = await getMeApi();
        setUser(data.data);
      } catch (error) {
        console.log(error);
        setUser(null);
      } finally {
        setLoading(false);
      }

    };

    fetchUser();
  },[])


  // 📝 Login function
  const login = async (credentials)=>{
    try {
      const data = await loginAPI(credentials);
      setUser(data.data);
      return data;
    } catch (error) {
      // Re-throw the error so the component can handle it
      throw error;
    }
  }

  // 📝 Signup function
  const register = async (credentials)=>{
    try {
      const data = await signupAPI(credentials);
      setUser(data.data);
      return data;
    } catch (error) {
      // Re-throw the error so the component can handle it
      throw error;
    }
  }


  // 🚪 Logout function
  const logout = async ()=>{
    await logoutAPI();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
