"use client"

import { useEffect, useState } from "react"

import { supabase }
from "../../../../lib/supabaseClient"

import DashboardLayout
from "../../../components/layouts/DashboardLayout"

import AuthGuard
from "../../../components/guards/AuthGuard"

export default function MasterLayananPage(){

  const [layanans,setLayanans]
    = useState([])

  const [loading,setLoading]
    = useState(true)

  const [showModal,setShowModal]
    = useState(false)

  const [editId,setEditId]
    = useState(null)

  const [form,setForm]
    = useState({

      nama_layanan:"",

      kode_layanan:"",

      loket_tujuan:"",

      limit_harian:100,

      status_layanan:true
    })

  useEffect(()=>{

    getData()

  },[])

  async function getData(){

    setLoading(true)

    const { data,error }
      = await supabase

      .from("layanans")

      .select("*")

      .order(
        "nama_layanan",
        {
          ascending:true
        }
      )

    if(error){

      console.log(error)

      return
    }

    setLayanans(data || [])

    setLoading(false)
  }

  async function saveData(){

    if(!form.nama_layanan){

      alert("Nama layanan wajib diisi")

      return
    }

    if(editId){

      await supabase

        .from("layanans")

        .update(form)

        .eq("id",editId)

    }else{

      await supabase

        .from("layanans")

        .insert([form])
    }

    resetForm()

    getData()
  }

  function editData(item){

    setEditId(item.id)

    setForm({

      nama_layanan:
        item.nama_layanan,

      kode_layanan:
        item.kode_layanan,

      loket_tujuan:
        item.loket_tujuan,

      limit_harian:
        item.limit_harian,

      status_layanan:
        item.status_layanan
    })

    setShowModal(true)
  }

  async function hapusData(id){

    const ok = confirm(
      "Yakin hapus layanan?"
    )

    if(!ok) return

    await supabase

      .from("layanans")

      .delete()

      .eq("id",id)

    getData()
  }

  function resetForm(){

    setEditId(null)

    setForm({

      nama_layanan:"",

      kode_layanan:"",

      loket_tujuan:"",

      limit_harian:100,

      status_layanan:true
    })

    setShowModal(false)
  }

  return(

    <AuthGuard allowedRole="admin">

      <DashboardLayout role="admin">

        <div className="space-y-6">

          {/* HEADER */}

          <div className="flex justify-between items-center">

            <div>

              <h1
                className="
                  text-3xl
                  font-bold
                "
              >
                Master Layanan
              </h1>

              <p className="text-gray-500">

                Kelola layanan Disdukcapil

              </p>

            </div>

            <button

              onClick={()=>
                setShowModal(true)
              }

              className="
                bg-blue-600
                text-white
                px-5
                py-3
                rounded-xl
              "
            >

              + Tambah

            </button>

          </div>

          {/* TABLE */}

          <div
            className="
              bg-white
              rounded-2xl
              shadow
              overflow-hidden
            "
          >

            <table className="w-full">

              <thead
                className="
                  bg-gray-100
                "
              >

                <tr>

                  <th className="p-4 text-left">
                    Nama Layanan
                  </th>

                  <th className="p-4 text-left">
                    Kode
                  </th>

                  <th className="p-4 text-left">
                    Loket
                  </th>

                  <th className="p-4 text-left">
                    Limit
                  </th>

                  <th className="p-4 text-left">
                    Status
                  </th>

                  <th className="p-4 text-left">
                    Aksi
                  </th>

                </tr>

              </thead>

              <tbody>

                {
                  loading
                  ? (

                    <tr>

                      <td
                        colSpan="6"
                        className="
                          p-10
                          text-center
                        "
                      >

                        Loading...

                      </td>

                    </tr>

                  )

                  : layanans.length > 0

                  ? (

                    layanans.map((item)=>(

                      <tr
                        key={item.id}
                        className="border-t"
                      >

                        <td className="p-4">

                          {item.nama_layanan}

                        </td>

                        <td className="p-4">

                          {item.kode_layanan}

                        </td>

                        <td className="p-4">

                          {item.loket_tujuan}

                        </td>

                        <td className="p-4">

                          {item.limit_harian}

                        </td>

                        <td className="p-4">

                          {
                            item.status_layanan
                            ? "Aktif"
                            : "Nonaktif"
                          }

                        </td>

                        <td className="p-4">

                          <div className="flex gap-2">

                            <button

                              onClick={()=>
                                editData(item)
                              }

                              className="
                                bg-yellow-500
                                text-white
                                px-3 py-2
                                rounded-lg
                              "
                            >

                              Edit

                            </button>

                            <button

                              onClick={()=>
                                hapusData(item.id)
                              }

                              className="
                                bg-red-600
                                text-white
                                px-3 py-2
                                rounded-lg
                              "
                            >

                              Hapus

                            </button>

                          </div>

                        </td>

                      </tr>

                    ))

                  )

                  : (

                    <tr>

                      <td
                        colSpan="6"
                        className="
                          p-10
                          text-center
                        "
                      >

                        Belum ada data

                      </td>

                    </tr>

                  )
                }

              </tbody>

            </table>

          </div>

        </div>

        {/* MODAL */}

        {
          showModal && (

            <div
              className="
                fixed
                inset-0
                bg-black/40
                flex
                items-center
                justify-center
                z-50
              "
            >

              <div
                className="
                  bg-white
                  w-full
                  max-w-lg
                  rounded-2xl
                  p-6
                "
              >

                <h2
                  className="
                    text-xl
                    font-bold
                    mb-5
                  "
                >

                  {
                    editId
                    ? "Edit Layanan"
                    : "Tambah Layanan"
                  }

                </h2>

                <div className="space-y-4">

                  <input
                    placeholder="Nama Layanan"
                    value={form.nama_layanan}
                    onChange={(e)=>

                      setForm({

                        ...form,

                        nama_layanan:
                          e.target.value
                      })

                    }
                    className="w-full border p-3 rounded"
                  />

                  <input
                    placeholder="Kode Layanan"
                    value={form.kode_layanan}
                    onChange={(e)=>

                      setForm({

                        ...form,

                        kode_layanan:
                          e.target.value
                      })

                    }
                    className="w-full border p-3 rounded"
                  />

                  <input
                    placeholder="Loket Tujuan"
                    value={form.loket_tujuan}
                    onChange={(e)=>

                      setForm({

                        ...form,

                        loket_tujuan:
                          e.target.value
                      })

                    }
                    className="w-full border p-3 rounded"
                  />

                  <input
                    type="number"
                    placeholder="Limit Harian"
                    value={form.limit_harian}
                    onChange={(e)=>

                      setForm({

                        ...form,

                        limit_harian:
                          e.target.value
                      })

                    }
                    className="w-full border p-3 rounded"
                  />

                </div>

                <div className="flex justify-end gap-3 mt-6">

                  <button
                    onClick={resetForm}
                    className="
                      px-4
                      py-2
                      bg-gray-300
                      rounded-lg
                    "
                  >
                    Batal
                  </button>

                  <button
                    onClick={saveData}
                    className="
                      px-4
                      py-2
                      bg-blue-600
                      text-white
                      rounded-lg
                    "
                  >
                    Simpan
                  </button>

                </div>

              </div>

            </div>

          )
        }

      </DashboardLayout>

    </AuthGuard>
  )
}