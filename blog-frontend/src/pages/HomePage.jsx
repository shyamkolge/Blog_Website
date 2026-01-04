import React, { useEffect, useState } from 'react'
import { getAllBlogsAPI, checkUserLikedAPI } from '../api/blog.api'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiUser, FiHeart, FiMessageCircle, FiEye } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'



const HomePage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [likedBlogs, setLikedBlogs] = useState(new Set())
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    if (user && blogs.length > 0) {
      checkLikedStatuses()
    }
  }, [user, blogs])

  const fetchBlogs = async () => {
    try {
      setLoading(true)
      const response = await getAllBlogsAPI()
      if (response.success && response.data && response.data.length > 0) {
        setBlogs(response.data)
      } 
    } catch (err) {
      // On error, use sample data
      setError('Failed to load blogs. Please try again later.')
      console.error('Error fetching blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  const checkLikedStatuses = async () => {
    if (!user) return
    
    const likedSet = new Set()
    
    // Check like status for each blog
    const promises = blogs.map(async (blog) => {
      try {
        const response = await checkUserLikedAPI(blog._id)
        if (response.success && response.data.liked) {
          likedSet.add(blog._id)
        }
      } catch (err) {
        // Silently fail - user might not be logged in or blog might not exist
        console.error(`Error checking like status for blog ${blog._id}:`, err)
      }
    })
    
    await Promise.all(promises)
    setLikedBlogs(likedSet)
  }

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const truncateContent = (content, maxLength = 150) => {
    if (!content) return ''
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blogs...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={fetchBlogs}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Hero Section */}
       <div className="mb-12 text-center">
         <h1 className="text-4xl md:text-5xl font-bold dark:text-white text-gray-900 mb-4">
           Discover stories, thinking, and expertise
         </h1>
         <p className="text-xl text-gray-600 max-w-2xl mx-auto">
           Explore articles from writers on any topic
         </p>
       </div>


      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No blogs found</p>
          <p className="text-gray-400 dark:text-gray-500">Be the first to write a blog!</p>
        </div>
      ) : (
        <div className="space-y-8 pb-8">
          {blogs.map((blog) => (
            <article
              key={blog._id}
              className="border-b border-gray-200 dark:border-gray-800 pb-8 cursor-pointer hover:opacity-90 transition overflow-hidden"
            >
              <div className={`flex flex-col ${blog.featureImages ? 'md:flex-row' : ''} gap-6 w-full`} >
                {/* Blog Content */}
                <div className={`${blog.featureImages ? 'flex-1 min-w-0' : 'w-full'} overflow-hidden`}>
                  {/* Author & Date */}
                  <div className="flex items-center space-x-3 mb-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                    {blog.author?.profilePhoto ? (
                      <img
                        src={blog.author.profilePhoto}
                        alt={blog.author.username}
                        className="w-6 h-6 rounded-full shrink-0"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                        <FiUser className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </div>
                    )}
                    <span className="font-medium whitespace-nowrap">
                      {blog.author?.firstName} {blog.author?.lastName}
                    </span>
                    <span className="text-gray-400 dark:text-gray-600">•</span>
                    <span className="flex items-center space-x-1 whitespace-nowrap">
                      <FiClock className="w-4 h-4" />
                      <span>{formatDate(blog.createdAt)}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h2  onClick={() => navigate(`/blog/${blog.slug}`)} className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 hover:text-gray-700 dark:hover:text-gray-300 transition break-words">
                    {blog.tittle}
                  </h2>

                  {/* Content Preview */}
                  <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed break-words overflow-wrap-anywhere">
                    {truncateContent(blog.content)}
                  </p>

                  {/* Category & Stats */}
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
                      {blog.category && (
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-700 dark:text-gray-300 whitespace-nowrap">
                          {blog.category.name || 'Uncategorized'}
                        </span>
                      )}
                      <div className="flex items-center space-x-4 flex-wrap">
                        <span className={`flex items-center space-x-1 whitespace-nowrap ${likedBlogs.has(blog._id) ? 'text-red-600 dark:text-red-400' : ''}`}>
                          <FiHeart className={`w-4 h-4 shrink-0 ${likedBlogs.has(blog._id) ? 'fill-current' : ''}`} />
                          <span>{blog.likeCount || 0}</span>
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/blog/${blog.slug}#comments`);
                          }}
                          className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition whitespace-nowrap"
                          title="View comments"
                        >
                          <FiMessageCircle className="w-4 h-4 shrink-0" />
                          <span>{blog.commentCount || 0}</span>
                        </button>
                        <span className="flex items-center space-x-1 whitespace-nowrap">
                          <FiEye className="w-4 h-4 shrink-0" />
                          <span>{blog.readCount || 0}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Blog Image */}
                {blog.featureImages && (
                  <div className="md:w-48 lg:w-64 shrink-0">
                    <img
                      src={blog.featureImages}
                      alt={blog.tittle}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage