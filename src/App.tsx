import type { ReactElement } from 'react'
import { Navigate, Route, Routes, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import LoginScreen from './screens/LoginScreen'
import TopicsScreen from './screens/TopicsScreen'
import PathScreen from './screens/PathScreen'
import ExerciseScreen from './screens/ExerciseScreen'
import './App.css'

function TopBar() {
  const { username, logout } = useAuth()
  const navigate = useNavigate()
  if (!username) return null

  return (
    <div className="topbar">
      <Link to="/topics" className="topbar-title">
        📚 Tutor
      </Link>
      <div className="topbar-user">
        <span>{username}</span>
        <button
          className="btn-link"
          onClick={() => {
            logout()
            navigate('/login')
          }}
        >
          Log out
        </button>
      </div>
    </div>
  )
}

function RequireAuth({ children }: { children: ReactElement }) {
  const { username } = useAuth()
  if (!username) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <TopBar />
      <div className="container">
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/topics"
            element={
              <RequireAuth>
                <TopicsScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/path/:topic"
            element={
              <RequireAuth>
                <PathScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/exercise/:topic/:levelSlug/:fileName"
            element={
              <RequireAuth>
                <ExerciseScreen />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/topics" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
