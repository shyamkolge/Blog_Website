import React from 'react'

const FollowingPage = () => {
  return (
    <section className='w-full'>
        <div className='mb-8'>
            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2'>Following</h1>
            <p className='text-gray-600 dark:text-gray-300'>The people you are following</p>
        </div>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
           <h1 className='text-center text-2xl font-bold text-gray-900 dark:text-white'>ToDo</h1>
        </div>
    </section>
  )
}

export default FollowingPage