"use client"

import { useState, type FormEvent } from "react"
import { loginUser } from "../utils/supabase-auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const user = await loginUser({ username: identifier, password })
    if (!user) {
      setError("Invalid credentials")
    } else {
      window.location.reload() // or route to dashboard
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-20 flex w-full max-w-sm flex-col gap-4">
      <Input
        type="text"
        placeholder="Email or username"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  )
}

/* default export maintained for backwards compatibility */
export default LoginForm
