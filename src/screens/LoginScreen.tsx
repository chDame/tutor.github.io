import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'
import { createAccount, findAccount, getAccounts } from '../storage'

const CURRENT_YEAR = new Date().getFullYear()

export default function LoginScreen() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const accounts = getAccounts()

  const [username, setUsername] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [error, setError] = useState<string | null>(null)

  function enter(name: string) {
    login(name)
    navigate('/topics')
  }

  function handleCreate(e: FormEvent) {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Please enter a username.')
      return
    }
    if (findAccount(trimmed)) {
      setError('This username already exists — pick it from the list above, or choose another name.')
      return
    }
    const year = Number(birthYear)
    if (!Number.isInteger(year) || year < CURRENT_YEAR - 100 || year > CURRENT_YEAR) {
      setError('Please enter a valid birth year.')
      return
    }
    createAccount(trimmed, year)
    enter(trimmed)
  }

  return (
    <div className="login-card">
      <h1>Welcome 👋</h1>
      <p>Sign in to track your progress.</p>

      {accounts.length > 0 && (
        <>
          <div className="account-list">
            {accounts.map((a) => (
              <button key={a.username} className="account-chip" onClick={() => enter(a.username)}>
                {a.username}
              </button>
            ))}
          </div>
          <hr className="divider" />
          <p>Or create a new account:</p>
        </>
      )}

      <form onSubmit={handleCreate}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. leo123"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor="birthYear">Birth year</label>
          <input
            id="birthYear"
            type="number"
            inputMode="numeric"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            placeholder="e.g. 2014"
          />
        </div>
        {error && <p className="error-text">{error}</p>}
        <button type="submit" className="btn">
          Create account
        </button>
      </form>
    </div>
  )
}
