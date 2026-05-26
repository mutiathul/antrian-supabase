"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function RegisterPage() {

  const router = useRouter()

  const [nama, setNama] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleRegister(e) {

    e.preventDefault()

    try {

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        alert(error.message)
        return
      }

      const user = data.user

      if (!user) {
        alert("User gagal dibuat")
        return
      }

      const { error: profileError } = await supabase
        .from("users")
        .insert([
          {
            id: user.id,
            nama_lengkap: nama,
            email: email,
            role: "masyarakat",
          },
        ])

      if (profileError) {
        console.log(profileError)
        alert(profileError.message)
        return
      }

      alert("Register berhasil")

      router.push("/login")

    } catch (err) {

      console.log(err)
      alert("Terjadi error")

    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >

        <h1 className="text-2xl font-bold mb-5">
          Register Masyarakat
        </h1>

        <input
          type="text"
          placeholder="Nama Lengkap"
          className="w-full border p-3 rounded mb-3"
          onChange={(e) => setNama(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-3 rounded mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
  className="bg-blue-600 text-white w-full p-3 rounded"
>
  Daftar
</button>

{/* REGISTER */}

<div className="text-center mt-5">

  <p className="text-gray-600">

    Sudah punya akun?

  </p>

  <a
    href="/login"
    className="
      text-blue-600
      font-semibold
      hover:underline
    "
  >

    Login Sekarang

  </a>

</div>

      </form>

    </div>
  )
}