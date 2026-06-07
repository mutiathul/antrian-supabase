"use client";

import { useEffect, useState, useCallback } from "react";

import { supabase } from "../../../../../lib/supabaseClient";

import DashboardLayout from "../../../../components/layouts/DashboardLayout";

import AuthGuard from "../../../../components/guards/AuthGuard";

export default function RekapanByNamePage() {
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState([]);

  const [search, setSearch] = useState("");

//   const [tanggalAwal, setTanggalAwal] = useState("");

//   const [tanggalAkhir, setTanggalAkhir] = useState("");

// const [periode,setPeriode]
// = useState("semua");

//   const [periode,setPeriode]
//   = useState("hari")
const [periode,setPeriode]
= useState("hari")

const [tanggal,setTanggal]
= useState("")

const [bulan,setBulan]
= useState("")

const [tahun,setTahun]
= useState(
  new Date()
    .getFullYear()
    .toString()
)

function resetFilter(){

  setPeriode("hari")

  setTanggal("")

  setBulan("")

  setTahun(
    new Date()
      .getFullYear()
      .toString()
  )

  setSearch("")

  setCurrentPage(1)

}
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    setLoading(true);

    const { data, error } = await supabase

      .from("antrians")

      .select(
        `

        *,

        layanans(
          nama_layanan
        )

      `,
      )

      .order("created_at", {
        ascending: true,
      });

    if (error) {
      console.log(error);

      setLoading(false);

      return;
    }

    setData(data || []);

    setLoading(false);
  }

  // ====================
  // FILTER
  // ====================

//   const filteredData = data.filter((item) => {
//     const cocokNama = item.nama_pemohon
//       ?.toLowerCase()

//       .includes(search.toLowerCase());

//     let cocokTanggal = true;

//     if (tanggalAwal && tanggalAkhir) {
//       const tanggalData = item.created_at?.split("T")[0];

//       cocokTanggal = tanggalData >= tanggalAwal && tanggalData <= tanggalAkhir;
//     }

//     return cocokNama && cocokTanggal;
//   });
// const filteredData = data.filter((item)=>{

//   const cocokNama =
//     item.nama_pemohon
//       ?.toLowerCase()
//       .includes(
//         search.toLowerCase()
//       )

//   const tanggalData =
//     new Date(item.created_at)

//   const sekarang =
//     new Date()

//   let cocokPeriode = true

//   // =====================
//   // HARI INI
//   // =====================

//   if(periode === "hari"){

//     cocokPeriode =

//       tanggalData
//         .toDateString()

//       ===

//       sekarang
//         .toDateString()
//   }

//   // =====================
//   // MINGGU INI
//   // =====================

//   else if(
//     periode === "minggu"
//   ){

//     const awalMinggu =
//       new Date()

//     awalMinggu.setDate(
//       sekarang.getDate() - 7
//     )

//     cocokPeriode =
//       tanggalData >= awalMinggu
//   }

//   // =====================
//   // BULAN INI
//   // =====================

//   else if(
//     periode === "bulan"
//   ){

//     cocokPeriode =

//       tanggalData.getMonth()

//       ===

//       sekarang.getMonth()

//       &&

//       tanggalData.getFullYear()

//       ===

//       sekarang.getFullYear()
//   }

//   // =====================
//   // TAHUN INI
//   // =====================

//   else if(
//     periode === "tahun"
//   ){

//     cocokPeriode =

//       tanggalData.getFullYear()

//       ===

//       sekarang.getFullYear()
//   }

//   return (
//     cocokNama
//     &&
//     cocokPeriode
//   )

// })

const filteredData = data.filter((item)=>{

  const cocokNama =

    item.nama_pemohon
      ?.toLowerCase()
      .includes(
        search.toLowerCase()
      )

  const tanggalData =
    new Date(item.created_at)

  let cocokPeriode = true

  // ======================
  // FILTER HARI
  // ======================

  if(
    periode === "hari"
  ){

    if(tanggal){

      const tglDb =
        item.created_at
          .split("T")[0]

      cocokPeriode =
        tglDb === tanggal
    }
  }

  // ======================
  // FILTER BULAN
  // ======================

  else if(
    periode === "bulan"
  ){

    if(bulan){

      const [year,month]
      = bulan.split("-")

      cocokPeriode =

        tanggalData
          .getMonth() + 1

        ===

        parseInt(month)

        &&

        tanggalData
          .getFullYear()

        ===

        parseInt(year)
    }
  }

  // ======================
  // FILTER TAHUN
  // ======================

  else if(
    periode === "tahun"
  ){

    cocokPeriode =

      tanggalData
        .getFullYear()

      ===

      parseInt(tahun)
  }

  return (
    cocokNama
    &&
    cocokPeriode
  )

})
  // ====================
  // PAGINATION
  // ====================

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const endIndex = startIndex + itemsPerPage;

  const paginatedData = filteredData.slice(startIndex, endIndex);
  // ====================
  // CARD
  // ====================

  const totalPemohon = filteredData.length;

  const totalSelesai = filteredData.filter(
    (i) => i.status === "selesai",
  ).length;

  const totalDiproses = filteredData.filter(
    (i) => i.status === "diproses",
  ).length;

  const totalDitolak = filteredData.filter(
    (i) => i.status === "ditolak",
  ).length;

  return (
    <AuthGuard allowedRole="admin">
      <DashboardLayout role="admin">
        <div className="space-y-6">
          {/* HEADER */}

          <div>
            <h1
              className="
                text-3xl
                font-bold
              "
            >
              Rekapan Pelayanan
            </h1>

            <p
              className="
                text-gray-500
              "
            >
              Rekapan berdasarkan nama pemohon
            </p>
          </div>

          {/* CARD */}

          <div
            className="
              grid
              md:grid-cols-2
              xl:grid-cols-4
              gap-4
            "
          >
            <Card
              title="Total Pemohon"
              value={totalPemohon}
              color="bg-blue-600"
            />

            <Card title="Selesai" value={totalSelesai} color="bg-green-600" />

            <Card
              title="Diproses"
              value={totalDiproses}
              color="bg-yellow-500"
            />

            <Card title="Ditolak" value={totalDitolak} color="bg-red-600" />
          </div>

          {/* FILTER */}


<div
  className="
    bg-white
    rounded-2xl
    shadow-sm
    border
    border-gray-100
    p-6
  "
>
    <div
  className="
     grid
    grid-cols-1
    md:grid-cols-2
    xl:grid-cols-12
    gap-4
  "
>

  {/* PERIODE */}

  <div
    className="
       xl:col-span-2
    "
  >

    <label
      className="
        block
        text-sm
        font-semibold
        text-gray-700
        mb-2
      "
    >

      Periode

    </label>

    <select

      value={periode}

      onChange={(e)=>{

        setPeriode(
          e.target.value
        )

        setCurrentPage(1)

      }}

      className="
        w-full
        h-[52px]
        border
        border-gray-300
        rounded-xl
        px-4
      "
    >

      <option value="hari">
        Per Hari
      </option>

      <option value="bulan">
        Per Bulan
      </option>

      <option value="tahun">
        Per Tahun
      </option>

    </select>

  </div>


  {/* FILTER TANGGAL */}

  {

    periode === "hari" && (

      <div
        className="
           xl:col-span-3
        "
      >

        <label
          className="
            block
            text-sm
            font-semibold
            text-gray-700
            mb-2
          "
        >

          Pilih Tanggal

        </label>

        <input

          type="date"

          value={tanggal}

          onChange={(e)=>{

            setTanggal(
              e.target.value
            )

            setCurrentPage(1)

          }}

          className="
            w-full
            h-[52px]
            border
            border-gray-300
            rounded-xl
            px-4
          "

        />

      </div>

    )

  }


  {/* FILTER BULAN */}

  {

    periode === "bulan" && (

      <div
        className="
          xl:col-span-3
        "
      >

        <label
          className="
            block
            text-sm
            font-semibold
            text-gray-700
            mb-2
          "
        >

          Pilih Bulan

        </label>

        <input

          type="month"

          value={bulan}

          onChange={(e)=>{

            setBulan(
              e.target.value
            )

            setCurrentPage(1)

          }}

          className="
            w-full
            h-[52px]
            border
            border-gray-300
            rounded-xl
            px-4
          "

        />

      </div>

    )

  }


  {/* FILTER TAHUN */}

  {

    periode === "tahun" && (

      <div
        className="
           xl:col-span-3
        "
      >

        <label
          className="
            block
            text-sm
            font-semibold
            text-gray-700
            mb-2
          "
        >

          Pilih Tahun

        </label>

        <select

          value={tahun}

          onChange={(e)=>{

            setTahun(
              e.target.value
            )

            setCurrentPage(1)

          }}

          className="
            w-full
            h-[52px]
            border
            border-gray-300
            rounded-xl
            px-4
          "
        >

          {

            [...Array(10)].map(
              (_,i)=>{

                const year =

                  new Date()
                  .getFullYear()

                  - i

                return(

                  <option
                    key={year}
                    value={year}
                  >

                    {year}

                  </option>

                )

              }
            )

          }

        </select>

      </div>

    )

  }


  {/* SEARCH */}

  <div
  className="
    xl:col-span-7
  "
>

  <label
    className="
      block
      text-sm
      font-semibold
      text-gray-700
      mb-2
    "
  >

    Cari Nama Pemohon

  </label>

  <div
    className="
      flex
      flex-col
      md:flex-row
      gap-3
    "
  >

    <input

      type="text"

      placeholder="Cari nama pemohon..."

      value={search}

      onChange={(e)=>{

        setSearch(
          e.target.value
        )

        setCurrentPage(1)

      }}

      className="
        flex-1
        h-[52px]
        border
        border-gray-300
        rounded-xl
        px-4
      "
    />

    <button

      type="button"

      onClick={resetFilter}

      className="
        h-[52px]
        px-6

        rounded-xl

        bg-gray-200
        hover:bg-gray-300

        text-gray-700
        font-medium

        transition
      "
    >

      Reset

    </button>

  </div>

</div>

</div>
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
            <div
              className="
                overflow-x-auto
              "
            >
              <table className="w-full min-w-[900px]">
                <thead
                  className="
                    bg-gray-100
                  "
                >
                  <tr>
                    <th className="p-4">Nama</th>

                    <th className="p-4">JK</th>

                    <th className="p-4">Layanan</th>

                    <th className="p-4">Nomor</th>

                    <th className="p-4">Status</th>

                    <th className="p-4">Tanggal</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
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
                  ) : (
                    paginatedData.map((item) => (
                      <tr
                        key={item.id}
                        className="
                          border-t
                        "
                      >
                        <td className="p-4">{item.nama_pemohon}</td>

                        <td className="p-4">{item.jenis_kelamin}</td>

                        <td className="p-4">{item.layanans?.nama_layanan}</td>

                        <td className="p-4">{item.nomor_antrian}</td>

                        <td className="p-4">{item.status}</td>

                        <td className="p-4">
                          {new Date(item.created_at).toLocaleDateString(
                            "id-ID",
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {/* PAGINATION */}

            <div
              className="
    flex
    items-center
    justify-between
    px-5
    py-4
    border-t
  "
            >
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="
      px-4
      py-2
      rounded-lg
      bg-gray-100
      disabled:opacity-50
    "
              >
                Previous
              </button>

              <div
                className="
      flex
      gap-2
    "
              >
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`

            w-10
            h-10
            rounded-lg

            ${
              currentPage === index + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-100"
            }

          `}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="
      px-4
      py-2
      rounded-lg
      bg-gray-100
      disabled:opacity-50
    "
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      className={`
        ${color}
        text-white
        rounded-2xl
        p-5
      `}
    >
      <p>{title}</p>

      <h1
        className="
          text-4xl
          font-bold
          mt-2
        "
      >
        {value}
      </h1>
    </div>
  );
}
