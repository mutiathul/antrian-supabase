export default function AdminStatCard({

  title,
  value,
  color

}) {

  return (

    <div
      className={`
        ${color}
        text-white
        rounded-2xl
        p-5
      `}
    >

      <p>

        {title}

      </p>

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
  )
}