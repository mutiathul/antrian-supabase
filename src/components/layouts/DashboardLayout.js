"use client"

import Sidebar from "../Sidebar"
import Navbar from "../Navbar"

export default function DashboardLayout({
  children,
  role
}) {

  return (

    <div className="flex">

      <Sidebar role={role} />

      <div className="flex-1">

        <Navbar />

        <div className="p-5">

          {children}

        </div>

      </div>

    </div>
  )
}