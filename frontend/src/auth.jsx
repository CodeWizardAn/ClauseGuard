import { createContext, useContext, useEffect, useState } from 'react'
import API from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const saveSession = (token, nextUser) => {
    localStorage.setItem('token', token)
    if (nextUser) localStorage.setItem('cg-user', JSON.stringify(nextUser))
    setUser(nextUser)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('cg-user')
    sessionStorage.removeItem('vault-open')
    setUser(null)
  }

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }
    API.get('/auth/me')
      .then(res => {
        setUser(res.data)
        localStorage.setItem('cg-user', JSON.stringify(res.data))
      })
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, saveSession, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
