import React, { useState } from 'react'
import { SlNote } from "react-icons/sl";
import { BsSendPlusFill } from "react-icons/bs";

const Notes = () => {
  const [loading,setLoading] = useState(false)

  const CreateNote = () => {
    setLoading(true)
    setTimeout(() => setLoading(false), 1500)
  }

  return (
    <div>

      {/* Header */}
      <div className='flex items-center gap-3 mb-4'>
        <SlNote size={38} className='bg-orange-100 text-orange-500 rounded p-2' />
        <h2 className='text-2xl font-bold text-gray-700'>Lead Notes</h2>
      </div>

      {/* Notes List */}
      <div className='space-y-4'>
        <div className='bg-gray-100 rounded-xl p-4'>
          <p>Hi this is notes</p>
          <p className='text-sm text-right text-gray-500 mt-2'>
            By engineer on 13/08/25 at 12:06 AM
          </p>
        </div>

        <div className='bg-gray-100 rounded-xl p-4 text-gray-500'>
          No Notes Data Available
        </div>
      </div>

      {/* Create Note */}
      <div className='flex flex-col md:flex-row gap-3 mt-6'>
        <input
          type="text"
          placeholder='Create notes...'
          className='flex-1 p-3 rounded-lg border focus:ring-2 focus:ring-orange-400 outline-none'
        />

        <button
          onClick={() => !loading && CreateNote()}
          className={`bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-lg flex items-center justify-center gap-2 ${loading && 'opacity-50'}`}
        >
          {loading ? "Creating..." : <><BsSendPlusFill /> Create Note</>}
        </button>
      </div>

    </div>
  )
}

export default Notes