import React from 'react'

const Card = ({title,count,bg,color}) => {
  
  return (
    <div className={`w-[210px] h-[100px] p-4 rounded-md flex flex-col gap-3 shadow-xs border-l-4`} style={{backgroundColor:bg,color:color}}>
         <h4 className='text-md font-semibold'>{title}</h4>
         <p className='text-xl font-bold'>{count}</p>
    </div>
  )
}

export default Card