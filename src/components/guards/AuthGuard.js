"use client"

import { useEffect, useState } from "react"

import { supabase } from "../../../lib/supabaseClient"

import { useRouter } from "next/navigation"

export default function AuthGuard({
  children,
  allowedRole
}) {

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [allowed, setAllowed] = useState(false)

  useEffect(() => {

    checkUser()

  }, [])

  async function checkUser() {

    try {

      // ambil session
      const {
        data: { session }
      } = await supabase.auth.getSession()

      // kalau belum login
      if (!session) {

        router.replace("/login")
        return
      }

      // ambil data user
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()
        console.log("SESSION:", session)
console.log("USER DATA:", userData)
console.log("ROLE:", userData?.role)
console.log("ALLOWED:", allowedRole)

      if (error || !userData) {

        console.log(error)

        router.replace("/login")
        return
      }

      // cek role
      if (userData.role !== allowedRole) {

        router.replace("/login")
        return
      }

      setAllowed(true)

    } catch (err) {

      console.log(err)

      router.replace("/login")

    } finally {

      setLoading(false)
    }
  }

  // loading screen
  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        <h1 className="text-2xl font-bold">
          Loading...
        </h1>

      </div>
    )
  }

  // kalau tidak diizinkan
  if (!allowed) {

    return null
  }

  return children
}