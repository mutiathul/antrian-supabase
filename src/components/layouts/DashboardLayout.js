"use client"

import { useState, useEffect } from "react"

import { supabase }
from "../../../lib/supabaseClient"

import { useRouter }
from "next/navigation"

import Sidebar
from "../Sidebar"

import {

  Menu,
  LogOut

} from "lucide-react"

export default function DashboardLayout({

  children,
  role

}){

  const [sidebarOpen, setSidebarOpen]
    = useState(false)

  const router = useRouter()
useEffect(() => {

  let timeout

  const resetTimer = () => {

    clearTimeout(timeout)

    timeout = setTimeout(
      async () => {

        await supabase.auth.signOut()

        router.replace("/login")

      },
      60 * 60 * 1000
    )
  }

  window.addEventListener(
    "mousemove",
    resetTimer
  )

  window.addEventListener(
    "keydown",
    resetTimer
  )

  window.addEventListener(
    "click",
    resetTimer
  )

  resetTimer()

  return () => {

    clearTimeout(timeout)

    window.removeEventListener(
      "mousemove",
      resetTimer
    )

    window.removeEventListener(
      "keydown",
      resetTimer
    )

    window.removeEventListener(
      "click",
      resetTimer
    )
  }

}, [])
  // =========================
  // LOGOUT
  // =========================
  async function handleLogout(){

    const konfirmasi = confirm(
      "Yakin ingin logout?"
    )

    if(!konfirmasi) return

    await supabase.auth.signOut()

    router.replace("/login")
  }

  return(

    <div className="
      min-h-screen
      bg-gray-100
    ">

      {/* SIDEBAR */}

      <Sidebar

        role={role}

        sidebarOpen={sidebarOpen}

        setSidebarOpen={setSidebarOpen}

      />

      {/* MAIN CONTENT */}

      <div
        className="

          lg:ml-[280px]

          min-h-screen

          flex
          flex-col

        "
      >

        {/* ========================= */}
        {/* TOPBAR */}
        {/* ========================= */}

        <header
          className="

            sticky
            top-0
            z-30

            h-[74px]

            bg-white/90
            backdrop-blur-md

            border-b
            border-gray-200

            px-4
            sm:px-6

            flex
            items-center
            justify-between

            shadow-sm

          "
        >

          {/* LEFT */}

          <div className="
            flex
            items-center
            gap-3
          ">

            {/* MENU MOBILE */}

            <button
              onClick={()=>
                setSidebarOpen(true)
              }
              className="

                lg:hidden

                w-11
                h-11

                rounded-xl

                bg-blue-600
                hover:bg-blue-700

                text-white

                flex
                items-center
                justify-center

                transition

              "
            >

              <Menu size={22} />

            </button>

            {/* TITLE */}

            <div>

              <h1 className="
                text-lg
                sm:text-2xl
                font-bold
                text-gray-800
              ">

                Dashboard

              </h1>

              <p className="
                text-xs
                sm:text-sm
                text-gray-500
                mt-0.5
              ">

                Sistem Antrian Disdukcapil

              </p>

            </div>

          </div>

          {/* RIGHT */}

          <button
            onClick={handleLogout}
            className="

              flex
              items-center
              gap-2

              bg-red-500
              hover:bg-red-600

              text-white

              px-4
              sm:px-5

              h-11

              rounded-xl

              text-sm
              sm:text-base

              font-medium

              transition

              shadow-sm

            "
          >

            <LogOut size={18} />

            Logout

          </button>

        </header>

        {/* ========================= */}
        {/* PAGE CONTENT */}
        {/* ========================= */}

        <main
          className="

            flex-1

            p-4
            sm:p-6
            lg:p-8

          "
        >

          <div className="
            w-full
            max-w-[1600px]
            mx-auto
          ">

            {children}

          </div>

        </main>

      </div>

    </div>
  )
}