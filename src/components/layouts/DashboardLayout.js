"use client"

import { useState } from "react"

import { supabase } from "../../../lib/supabaseClient"

import { useRouter } from "next/navigation"

import Sidebar from "../Sidebar"

import { Menu } from "lucide-react"

export default function DashboardLayout({

  children,
  role

}){

  const [sidebarOpen, setSidebarOpen]
    = useState(false)

    const router = useRouter()
    async function handleLogout(){

  const konfirmasi = confirm(
    "Yakin ingin logout?"
  )

  if(!konfirmasi) return

  await supabase.auth.signOut()

  router.replace("/login")
}

  return(

    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR */}

      <Sidebar

        role={role}

        sidebarOpen={sidebarOpen}

        setSidebarOpen={setSidebarOpen}

      />

      {/* CONTENT */}

      <div className="flex-1">

        {/* TOPBAR */}

        <div
          className="
            bg-white shadow
            p-4
            flex items-center
          "
        >

          {/* BUTTON MENU */}

          <button
            onClick={()=>setSidebarOpen(true)}
            className="
              md:hidden
              bg-blue-600
              text-white
              p-2
              rounded
            "
          >

            <Menu size={24} />

          </button>

          <div className="flex-1 flex justify-between items-center">

  <h1 className="ml-3 font-bold text-xl">

    Dashboard

  </h1>

  <button
    onClick={handleLogout}
    className="
      bg-red-500
      text-white
      px-4 py-2
      rounded
    "
  >

    Logout

  </button>

</div>

        </div>

        {/* PAGE */}

        <div className="p-5">

          {children}

        </div>

      </div>

    </div>
  )
}