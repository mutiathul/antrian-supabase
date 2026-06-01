"use client"

import { Menu } from "lucide-react"

export default function Navbar({

  openSidebar

}) {

  return (

    <header
      className="
        sticky
        top-0
        z-30
        h-[70px]
        bg-white/90
        backdrop-blur
        border-b
        border-gray-200
        px-4
        sm:px-6
        flex
        items-center
        justify-between
      "
    >

      {/* LEFT */}

      <div className="
        flex
        items-center
        gap-3
      ">

        {/* MOBILE BUTTON */}

        <button
          onClick={openSidebar}
          className="
            lg:hidden
            w-10
            h-10
            rounded-xl
            hover:bg-gray-100
            flex
            items-center
            justify-center
          "
        >

          <Menu size={22} />

        </button>

        <h1 className="
          text-lg
          sm:text-xl
          font-bold
          text-gray-800
        ">

          Sistem Antrian

        </h1>

      </div>

    </header>
  )
}