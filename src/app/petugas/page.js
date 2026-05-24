'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'

export default function PetugasPage(){

  const [antrian, setAntrian] = useState([])

  async function getAntrian(){

    const { data } = await supabase
      .from('antrian')
      .select('*')
      .eq('status','menunggu')
      .order('nomor')

    setAntrian(data)

  }

  async function panggil(id){

    await supabase
      .from('antrian')
      .update({
        status:'dipanggil'
      })
      .eq('id', id)

    getAntrian()

  }

  useEffect(()=>{

    getAntrian()

  },[])

  return (

    <div className="container mt-5">

      <h1>Petugas</h1>

      <table className="table">

        <thead>
          <tr>
            <th>Nomor</th>
            <th>Layanan</th>
            <th>Aksi</th>
          </tr>
        </thead>

        <tbody>

          {antrian.map((item)=>(

            <tr key={item.id}>

              <td>{item.nomor}</td>
              <td>{item.layanan}</td>

              <td>

                <button
                  className="btn btn-primary"
                  onClick={()=>panggil(item.id)}
                >
                  Panggil
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  )

}