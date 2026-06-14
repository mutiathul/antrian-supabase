"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabaseClient"

export default function ForgotPasswordPage(){

  const [email,setEmail] = useState("")
  const [loading,setLoading] = useState(false)

  async function handleReset(e){

    e.preventDefault()

    setLoading(true)

    const { error } =
      await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo:
            `${window.location.origin}/reset-password`
        }
      )

    setLoading(false)

    if(error){

      alert(error.message)
      return

    }

    alert(
      "Link reset password telah dikirim ke email Anda."
    )
  }

  return(

    <div className="min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleReset}
        className="
          bg-white
          p-8
          rounded-lg
          shadow-lg
          w-full
          max-w-md
        "
      >

        <h1 className="text-2xl font-bold mb-5">
          Hubungi petugas/admin untuk reset password.
        </h1>


        <button
  type="button"
  onClick={() => window.location.href = "/login"}
  className="
    bg-blue-600
    text-white
    w-full
    p-3
    rounded
  "
>

  Kembali ke Login

</button>
        

      </form>

    </div>
  )
}