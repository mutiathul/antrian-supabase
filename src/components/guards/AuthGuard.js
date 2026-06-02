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

    // =========================
    // LISTENER SESSION
    // =========================
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(
      async (event, session) => {

        if (
          event === "SIGNED_OUT"
        ) {

          router.replace("/login")
        }

        if (
          event === "TOKEN_REFRESHED"
        ) {

          console.log(
            "Token berhasil diperbarui"
          )
        }
      }
    )

    return () => {

      subscription.unsubscribe()
    }

  }, [])

  async function checkUser() {

    try {

      // =========================
      // AMBIL SESSION
      // =========================
      const {
        data: { session }
      } = await supabase.auth.getSession()

      // =========================
      // BELUM LOGIN
      // =========================
      if (!session) {

        router.replace("/login")
        return
      }

      // =========================
      // AMBIL USER
      // =========================
      const {
        data: userData,
        error
      } = await supabase

        .from("users")

        .select("*")

        .eq(
          "id",
          session.user.id
        )

        .single()

      console.log(
        "SESSION:",
        session
      )

      console.log(
        "USER DATA:",
        userData
      )

      console.log(
        "ROLE:",
        userData?.role
      )

      console.log(
        "ALLOWED:",
        allowedRole
      )

      if (
        error ||
        !userData
      ) {

        console.log(error)

        router.replace("/login")
        return
      }

      // =========================
      // CEK ROLE
      // =========================
      if (
        userData.role
        !== allowedRole
      ) {

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

  // =========================
  // LOADING
  // =========================
  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
        "
      >

        <h1
          className="
            text-2xl
            font-bold
          "
        >

          Loading...

        </h1>

      </div>
    )
  }

  // =========================
  // TIDAK DIIZINKAN
  // =========================
  if (!allowed) {

    return null
  }

  return children
}