"use client"

import Link from "next/link"

import { usePathname }
from "next/navigation"

import {

  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  UserCog,
  Clock3

} from "lucide-react"

export default function Sidebar({

  role,
  sidebarOpen,
  setSidebarOpen

}){

  const pathname = usePathname()

  // =========================
  // ACTIVE MENU
  // =========================
  function menuClass(path){

    return `

      flex
      items-center
      gap-3

      px-4
      py-3

      rounded-2xl

      transition-all
      duration-200

      text-sm
      sm:text-[15px]

      font-medium

      ${
        pathname === path

        ? `
          bg-white
          text-blue-700
          shadow-sm
        `

        : `
          text-blue-100
          hover:bg-blue-600
          hover:text-white
        `
      }

    `
  }

  return(

    <>

      {/* ========================= */}
      {/* BACKDROP MOBILE */}
      {/* ========================= */}

      {
        sidebarOpen && (

          <div
            className="
              fixed
              inset-0
              bg-black/50
              backdrop-blur-sm
              z-40
              lg:hidden
            "
            onClick={()=>
              setSidebarOpen(false)
            }
          />

        )
      }

      {/* ========================= */}
      {/* SIDEBAR */}
      {/* ========================= */}

      <aside
        className={`

          fixed
          top-0
          left-0
          z-50

          h-screen
          w-[280px]

          bg-gradient-to-b
          from-blue-700
          via-blue-700
          to-blue-800

          text-white

          border-r
          border-blue-600

          shadow-2xl

          transform
          transition-transform
          duration-300

          flex
          flex-col

          overflow-hidden

          ${
            sidebarOpen

            ? "translate-x-0"

            : "-translate-x-full lg:translate-x-0"
          }

        `}
      >

        {/* ========================= */}
        {/* HEADER */}
        {/* ========================= */}

        <div
          className="
            h-[80px]
            px-6
            flex
            items-center
            border-b
            border-blue-600
            shrink-0
          "
        >

          <div>

            <h1
              className="
                text-2xl
                font-extrabold
                tracking-wide
              "
            >

              E-Antrian

            </h1>

            <p
              className="
                text-sm
                text-blue-100
                mt-1
              "
            >

              Disdukcapil

            </p>

          </div>

        </div>

        {/* ========================= */}
        {/* MENU */}
        {/* ========================= */}

        <div
          className="
            flex-1
            overflow-y-auto
            px-4
            py-5
          "
        >

          <div className="space-y-2">

            {/* ========================= */}
            {/* ADMIN */}
            {/* ========================= */}

            {
              role === "admin" && (
                <>

                  <Link
                    href="/admin/dashboard"
                    className={
                      menuClass(
                        "/admin/dashboard"
                      )
                    }
                  >

                    <LayoutDashboard size={20} />

                    Dashboard

                  </Link>

                  <Link
                    href="/admin/layanan"
                    className={
                      menuClass(
                        "/admin/layanan"
                      )
                    }
                  >

                    <ClipboardList size={20} />

                    Kelola Layanan

                  </Link>

                  <Link
                    href="/admin/petugas"
                    className={
                      menuClass(
                        "/admin/petugas"
                      )
                    }
                  >

                    <UserCog size={20} />

                    Kelola Petugas

                  </Link>

                  <Link
                    href="/admin/rekapan"
                    className={
                      menuClass(
                        "/admin/rekapan"
                      )
                    }
                  >

                    <FileText size={20} />

                    Rekapan

                  </Link>

                </>
              )
            }

            {/* ========================= */}
            {/* PETUGAS */}
            {/* ========================= */}

            {
              role === "petugas" && (
                <>

                  <Link
                    href="/petugas/dashboard"
                    className={
                      menuClass(
                        "/petugas/dashboard"
                      )
                    }
                  >

                    <LayoutDashboard size={20} />

                    Dashboard

                  </Link>

                  <Link
  href="/petugas/riwayat"
  className={
    menuClass(
      "/petugas/riwayat"
    )
  }
>

  <Clock3 size={20} />

  Riwayat Penyelesaian

</Link>

                </>
              )
            }

            {/* ========================= */}
            {/* MASYARAKAT */}
            {/* ========================= */}

            {
              role === "masyarakat" && (
                <>

                  <Link
                    href="/user/dashboard"
                    className={
                      menuClass(
                        "/user/dashboard"
                      )
                    }
                  >

                    <LayoutDashboard size={20} />

                    Dashboard

                  </Link>

                  <Link
                    href="/user/ambil-antrian"
                    className={
                      menuClass(
                        "/user/ambil-antrian"
                      )
                    }
                  >

                    <Users size={20} />

                    Ambil Antrian

                  </Link>

                  <Link
                    href="/user/riwayat"
                    className={
                      menuClass(
                        "/user/riwayat"
                      )
                    }
                  >

                    <Clock3 size={20} />

                    Riwayat

                  </Link>

                </>
              )
            }

          </div>

        </div>

        {/* ========================= */}
        {/* FOOTER */}
        {/* ========================= */}

        <div
          className="
            border-t
            border-blue-600
            p-4
            text-xs
            text-blue-200
            shrink-0
          "
        >

          © 2026 Sistem Antrian

        </div>

      </aside>

    </>
  )
}