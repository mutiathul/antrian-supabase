"use client"

import Link from "next/link"

export default function Sidebar({

  role,
  sidebarOpen,
  setSidebarOpen

}){

  return(

    <>

      {/* BACKDROP MOBILE */}

      {
        sidebarOpen && (

          <div
            className="
              fixed inset-0 bg-black/50 z-40
              md:hidden
            "
            onClick={()=>setSidebarOpen(false)}
          />

        )
      }

      {/* SIDEBAR */}

      <div
        className={`

          fixed md:static top-0 left-0 z-50

          h-screen w-64

          bg-blue-700 text-white

          transform transition-transform duration-300

          flex flex-col

          ${sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
          }

        `}
      >

        {/* HEADER */}

        <div className="p-5 border-b border-blue-500">

          <h1 className="text-2xl font-bold">

            Sistem Antrian

          </h1>

          <p className="text-sm text-blue-100 mt-1">

            Disdukcapil

          </p>

        </div>

        {/* MENU */}

        <div className="flex-1 flex flex-col p-3 gap-2 overflow-y-auto">

          {/* ========================= */}
          {/* ADMIN */}
          {/* ========================= */}

          {
            role === "admin" && (
              <>

                <Link
                  href="/admin/dashboard"
                  className="
                    hover:bg-blue-800
                    p-3
                    rounded-lg
                    transition
                  "
                >
                  Dashboard
                </Link>

                <Link
                  href="/admin/layanan"
                  className="
                    hover:bg-blue-800
                    p-3
                    rounded-lg
                    transition
                  "
                >
                  Kelola Layanan
                </Link>

                <Link
                  href="/admin/petugas"
                  className="
                    hover:bg-blue-800
                    p-3
                    rounded-lg
                    transition
                  "
                >
                  Kelola Petugas
                </Link>

                <Link
                  href="/admin/rekapan"
                  className="
                    hover:bg-blue-800
                    p-3
                    rounded-lg
                    transition
                  "
                >
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
                  className="
                    hover:bg-blue-800
                    p-3
                    rounded-lg
                    transition
                  "
                >
                  Dashboard
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
                  className="
                    hover:bg-blue-800
                    p-3
                    rounded-lg
                    transition
                  "
                >
                  Dashboard
                </Link>

                <Link
                  href="/user/ambil-antrian"
                  className="
                    hover:bg-blue-800
                    p-3
                    rounded-lg
                    transition
                  "
                >
                  Ambil Antrian
                </Link>

                <Link
                  href="/user/riwayat"
                  className="
                    hover:bg-blue-800
                    p-3
                    rounded-lg
                    transition
                  "
                >
                  Riwayat
                </Link>

              </>
            )
          }

        </div>

      </div>

    </>
  )
}