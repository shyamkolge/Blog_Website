import React from 'react'

const AppLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
      <div className="w-10 h-10 border-2 dark:border-white border-dashed rounded-full animate-spin">
      </div>
    </div>
  )
}

export default AppLoader