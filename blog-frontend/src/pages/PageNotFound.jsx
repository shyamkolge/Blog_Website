import React from 'react'
import { useNavigate } from 'react-router-dom'

const PageNotFound = () => {

  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-6xl font-bold text-gray-800 dark:text-gray-200 mb-4">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">Oops! The page you're looking for doesn't exist.</p>
      <button
       
        onClick={()=> {navigate("/")}}
        className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Go to Home
      </button>
    </div>
  )
}

export default PageNotFound