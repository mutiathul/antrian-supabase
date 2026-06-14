"use client"

import { useEffect, useState }

from "react"

import { supabase }

from "../../../../lib/supabaseClient"

import DashboardLayout

from "../../../components/layouts/DashboardLayout"

import AuthGuard

from "../../../components/guards/AuthGuard"

export default function CetakAntrianPage(){

  const [userData,setUserData]
  = useState(null)

  const [antrians,setAntrians]
  = useState([])

  const [loading,setLoading]
  = useState(true)

  useEffect(()=>{

    getUser()

  },[])

  async function getUser(){

    const {
      data:{session}
    } = await supabase.auth.getSession()

    if(!session) return

    const { data }
    = await supabase

      .from("users")

      .select("*")

      .eq(
        "id",
        session.user.id
      )

      .single()

    setUserData(data)

    if(data?.loket === "FO"){

      getAntrians()

    }
  }

  async function getAntrians(){

    setLoading(true)

    const today =
      new Date()
      .toISOString()
      .split("T")[0]

    const { data,error }
    = await supabase

      .from("antrians")

      .select("*")

      .eq(
        "tanggal_antrian",
        today
      )

      .order(
        "created_at",
        {
          ascending:false
        }
      )

    if(error){

      console.log(error)

      setLoading(false)

      return
    }

    setAntrians(data || [])

    setLoading(false)
  }

//   function cetak(item){

//     const html = `
//       <html>
//       <head>
//         <title>Cetak Antrian</title>

//         <style>

//           body{
//             font-family:Arial;
//             text-align:center;
//             padding:20px;
//           }

//           h1{
//             margin:0;
//           }

//           .nomor{
//             font-size:50px;
//             font-weight:bold;
//             margin-top:20px;
//           }

//         </style>

//       </head>

//       <body>

//         <h2>
//           DISDUKCAPIL
//         </h2>

//         <p>
//           Nomor Antrian
//         </p>

//         <div class="nomor">

//           ${item.nomor_antrian}

//         </div>

//         <p>

//           ${item.nama_pemohon}

//         </p>

//       </body>

//       </html>
//     `

//     const win =
//       window.open(
//         "",
//         "",
//         "width=500,height=700"
//       )

//     win.document.write(html)

//     win.document.close()

//     win.print()
//   }

function cetak(item){

  const tanggal =
    new Date(
      item.created_at
    )

  const tanggalFormat =
    tanggal.toLocaleDateString(
      "id-ID"
    )

  const jamFormat =
    tanggal.toLocaleTimeString(
      "id-ID",
      {
        hour:"2-digit",
        minute:"2-digit"
      }
    )

  const win =
    window.open(
      "",
      "",
      "width=300,height=600"
    )

  win.document.write(`

<html>

<head>

<title>
Cetak Antrian
</title>

<style>

body{

  width:58mm;

  font-family:monospace;

  text-align:center;

  padding:10px;

  margin:0;
}

.judul{

  font-size:14px;
  font-weight:bold;
}

.nomor{

  font-size:36px;
  font-weight:bold;
  margin:15px 0;
}

.garis{

  border-top:1px dashed #000;
  margin:10px 0;
}

.label{

  text-align:left;
  font-size:12px;
}

</style>

</head>

<body>

<div class="judul">

DINAS KEPENDUDUKAN<br>
DAN PENCATATAN SIPIL<br>
KAB. LIMA PULUH KOTA

</div>

<div class="garis"></div>

<div>

NOMOR ANTRIAN

</div>

<div class="nomor">

${item.nomor_antrian}

</div>

<div class="garis"></div>

<div class="label">

<b>Nama :</b><br>
${item.nama_pemohon}
<br><br>

<b>Layanan :</b><br>
${item.nama_layanan || "-"}
<br><br>

<b>Loket :</b><br>
${item.loket}
<br><br>

<b>Tanggal :</b><br>
${tanggalFormat}
<br><br>

<b>Jam :</b><br>
${jamFormat} WIB

</div>

<div class="garis"></div>

<div>

Silakan menunggu<br>
hingga nomor dipanggil

<br><br>

Terima kasih

</div>

</body>

</html>

`)

  win.document.close()

  setTimeout(()=>{

    win.print()

  },500)
}

  if(
    userData &&
    userData.loket !== "FO"
  ){

    return(

      <AuthGuard allowedRole="petugas">

        <DashboardLayout role="petugas">

          <div className="p-10">

            <h1 className="text-2xl font-bold">

              Akses Ditolak

            </h1>

            <p>

              Menu ini hanya untuk FO

            </p>

          </div>

        </DashboardLayout>

      </AuthGuard>
    )
  }

  return(

    <AuthGuard allowedRole="petugas">

      <DashboardLayout role="petugas">

        <h1
          className="
            text-3xl
            font-bold
            mb-6
          "
        >

          Cetak Antrian

        </h1>

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

                <th className="p-4">

                  Nomor

                </th>

                <th className="p-4">

                  Nama

                </th>

                <th className="p-4">

                  Status

                </th>

                <th className="p-4">

                  Aksi

                </th>

              </tr>

            </thead>

            <tbody>

              {
                loading

                ?

                (
                  <tr>

                    <td
                      colSpan="4"
                      className="p-8"
                    >

                      Loading...

                    </td>

                  </tr>
                )

                :

                antrians.map((item)=>(

                  <tr
                    key={item.id}
                    className="border-t"
                  >

                    <td className="p-4">

                      {
                        item.nomor_antrian
                      }

                    </td>

                    <td className="p-4">

                      {
                        item.nama_pemohon
                      }

                    </td>

                    <td className="p-4">

                      {
                        item.status
                      }

                    </td>

                    <td className="p-4">

                      <button

                        onClick={()=>
                          cetak(item)
                        }

                        className="
                          bg-blue-600
                          text-white
                          px-4
                          py-2
                          rounded-lg
                        "
                      >

                        Cetak

                      </button>

                    </td>

                  </tr>

                ))
              }

            </tbody>

          </table>

        </div>

      </DashboardLayout>

    </AuthGuard>
  )
}