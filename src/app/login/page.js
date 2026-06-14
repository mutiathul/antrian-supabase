"use client"

import { useState } from "react"
import { supabase } from "../../../lib/supabaseClient"
import { useRouter } from "next/navigation"

export default function LoginPage(){

  const router = useRouter()

  const [email,setEmail] = useState("")
  const [password,setPassword] = useState("")
  const [identifier,setIdentifier] = useState("")

//   async function handleLogin(e){

//     e.preventDefault()

//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password
//     })

//     if(error){
//       alert(error.message)
//       return
//     }

//     const { data:userData } = await supabase
//       .from('users')
//       .select('*')
//       .eq('email',email)
//       .single()
// localStorage.setItem(
//   "lastActivity",
//   Date.now()
// )
//    if(userData?.role === "admin"){

//   router.replace("/admin/dashboard")

// }else if(userData?.role === "petugas"){

//   router.replace("/petugas/dashboard")

// }else{

//   router.replace("/user/dashboard")
// }

//   }
async function handleLogin(e){

  e.preventDefault()

  try{

    let loginEmail =
      identifier.trim()

    // ===================
    // JIKA NIK
    // ===================

    if(
      !loginEmail.includes("@")
    ){

      const response =
        await fetch(
          "/api/login-nik",
          {
            method:"POST",

            headers:{
              "Content-Type":
              "application/json"
            },

            body:JSON.stringify({

              nik:loginEmail

            })
          }
        )

      const result =
        await response.json()
        console.log("RESULT API:", result)

//     if(!result.success){

//   alert(result.error)
//   return

// }

if(result.error){

  alert(result.error.message || result.error)
  return

}

if(!result.data){

  alert("NIK tidak ditemukan")
  return

}

      // loginEmail =
      //   result.email

      loginEmail = result.data.email

        console.log("EMAIL HASIL NIK:", loginEmail)
    }

    // ===================
    // LOGIN AUTH
    // ===================

    // const { error } =
    //   await supabase.auth
    //     .signInWithPassword({

    //       email:loginEmail,

    //       password

    //     })
console.log(
  "LOGIN KE AUTH:",
  loginEmail
)
    const { data: authData, error } =
  await supabase.auth.signInWithPassword({
    email: loginEmail,
    password
  })

console.log("EMAIL LOGIN:", loginEmail)
console.log("AUTH DATA:", authData)
console.log("AUTH ERROR:", error)

if(error){
  alert(error.message)
  return
}

    if(error){

      alert(
        "Email/NIK atau password salah"
      )

      return
    }

    const {
      data:userData
    } = await supabase

      .from("users")

      .select("*")

      .eq(
        "email",
        loginEmail
      )

      .single()

    localStorage.setItem(

      "lastActivity",

      Date.now()

    )

    if(
      userData?.role ===
      "admin"
    ){

      router.replace(
        "/admin/dashboard"
      )

    }else if(

      userData?.role ===
      "petugas"

    ){

      router.replace(
        "/petugas/dashboard"
      )

    }else{

      router.replace(
        "/user/dashboard"
      )

    }

  }catch(error){

    console.log(error)

    alert(
      "Terjadi kesalahan"
    )

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

        {/* <input
          type="email"
          placeholder="Email"
          className="w-full border p-3 rounded mb-3"
          onChange={(e)=>setEmail(e.target.value)}
        /> */}
        <input
  type="text"
  placeholder="Email atau NIK"
  className="w-full border p-3 rounded mb-3"
  onChange={(e)=>setIdentifier(e.target.value)}
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
<div className="text-right mb-3">
  <a
    href="/forgot-password"
    className="
      text-sm
      text-blue-600
      hover:underline
    "
  >
    Lupa Password?
  </a>
</div>

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