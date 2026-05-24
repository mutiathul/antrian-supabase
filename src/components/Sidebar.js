"use client"

import Link from "next/link"

export default function Sidebar({ role }) {

  return (

    <div className="w-64 min-h-screen bg-blue-900 text-white p-5">

      <h1 className="text-2xl font-bold mb-10">
        Disdukcapil
      </h1>

      <ul className="space-y-3">

        {
          role === "admin" && (
            <>
              <li>
                <Link href="/admin/dashboard">
                  Dashboard
                </Link>
              </li>

              <li>
                <Link href="/admin/petugas">
                  Data Petugas
                </Link>
              </li>

              <li>
                <Link href="/admin/layanan">
                  Data Layanan
                </Link>
              </li>

              <li>
                <Link href="/admin/rekapan">
                  Rekapan
                </Link>
              </li>
            </>
          )
        }

        {
          role === "petugas" && (
            <>
              <li>
                <Link href="/petugas/dashboard">
                  Dashboard
                </Link>
              </li>

              <li>
                <Link href="/petugas/antrian">
                  Antrian Masuk
                </Link>
              </li>

              <li>
                <Link href="/petugas/rekapan">
                  Rekapan
                </Link>
              </li>
              <li><Link
  href="/petugas/layanan"
  className="hover:bg-blue-800 p-3 rounded"
>
  Kelola Layanan
</Link></li>

              
            </>
          )
        }

        {
          role === "masyarakat" && (
            <>
              <li>
                <Link href="/user/dashboard">
                  Dashboard
                </Link>
              </li>

              <li>
                <Link href="/user/ambil-antrian">
                  Ambil Antrian
                </Link>
              </li>

              <li>
                <Link href="/user/riwayat">
                  Riwayat
                </Link>
              </li>
            </>
          )
        }

      </ul>

    </div>
  )
}