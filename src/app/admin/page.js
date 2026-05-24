'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabaseClient'
import Sidebar from '../../components/Sidebar'

export default function AdminPage(){

  const [dataAntrian, setDataAntrian] = useState([])

  async function getData(){

    const { data } = await supabase
      .from('antrian')
      .select('*')
      .order('nomor')

    setDataAntrian(data)

  }

  useEffect(()=>{

    getData()

  },[])

  return (

    <div className="d-flex">

      <Sidebar />

      <div className="container-fluid p-4">

        <h2 className="mb-4">
          Dashboard Admin
        </h2>

        <div className="row mb-4">

          <div className="col-md-4">

            <div className="card shadow">

              <div className="card-body">

                <h5>Total Antrian</h5>

                <h2>
                  {dataAntrian.length}
                </h2>

              </div>

            </div>

          </div>

        </div>

        <div className="card shadow">

          <div className="card-body">

            <table className="table table-striped">

              <thead className="table-dark">

                <tr>
                  <th>Nomor</th>
                  <th>Layanan</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {dataAntrian.map((item)=>(

                  <tr key={item.id}>

                    <td>{item.nomor}</td>
                    <td>{item.layanan}</td>
                    <td>{item.status}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  )

}