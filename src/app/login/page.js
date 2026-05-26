"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LoginPage(){

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")

  async function handleLogin(e){

    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if(error){
      alert(error.message)
      return
    }

    const { data:userData } = await supabase
      .from('users')
      .select('*')
      .eq('email',email)
      .single()

   if(userData?.role === "admin"){

  router.replace("/admin/dashboard")

}else if(userData?.role === "petugas"){

  router.replace("/petugas/dashboard")

}else{

  router.replace("/user/dashboard")
}

  }

  return(

    <div className="min-h-screen flex items-center justify-center">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >

        <h1 className="text-2xl font-bold mb-5">
          Login Sistem
        </h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-3"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-3"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
  className="bg-blue-600 text-white w-full p-3 rounded"
>
  Login
</button>

{/* REGISTER */}

<div className="text-center mt-5">

  <p className="text-gray-600">

    Belum punya akun?

  </p>

  <a
    href="/register"
    className="
      text-blue-600
      font-semibold
      hover:underline
    "
  >

    Daftar Sekarang

  </a>

</div>

      </form>

    </div>
  )
}