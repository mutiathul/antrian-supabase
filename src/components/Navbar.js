"use client"

import { supabase } from "../../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function Navbar() {

  const router = useRouter()

  async function handleLogout() {

    const { error } = await supabase.auth.signOut()

    if (error) {
      alert(error.message)
      return
    }

    localStorage.clear()

    router.replace("/login")

    router.refresh()
  }

  return (

    <div className="bg-white shadow p-4 flex justify-between items-center">

      <h1 className="font-bold text-xl">
        Sistem Antrian Online
      </h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
      >
        Logout
      </button>

    </div>
  )
}