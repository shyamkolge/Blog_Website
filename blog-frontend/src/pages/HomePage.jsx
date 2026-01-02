import React, { useEffect, useState } from 'react'
import { getAllBlogsAPI, checkUserLikedAPI } from '../api/blog.api'
import { useNavigate } from 'react-router-dom'
import { FiClock, FiUser, FiHeart, FiMessageCircle, FiEye } from 'react-icons/fi'
import useAuth from '../hooks/useAuth'

// Sample blog data for testing
const sampleBlogs = [
  {
    _id: '1',
    tittle: 'Getting Started with React Hooks',
    content: 'React Hooks revolutionized the way we write React components. They allow us to use state and other React features without writing a class. In this comprehensive guide, we\'ll explore useState, useEffect, useContext, and more. Learn how to build modern React applications with functional components and hooks.',
    slug: 'getting-started-with-react-hooks',
    author: {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop'
    },
    category: { name: 'Technology', slug: 'technology' },
    featureImages: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
    likeCount: 42,
    commentCount: 12,
    readCount: 1250,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'public'
  },
  {
    _id: '2',
    tittle: 'The Art of Clean Code',
    content: 'Writing clean code is an art form that every developer should master. Clean code is easy to read, understand, and maintain. It follows best practices, has meaningful names, and is well-structured. In this article, we\'ll discuss the principles of clean code and how to apply them in your daily programming.',
    slug: 'the-art-of-clean-code',
    author: {
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    category: { name: 'Programming', slug: 'programming' },
    featureImages: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop',
    likeCount: 89,
    commentCount: 23,
    readCount: 3420,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'public'
  },
  {
    _id: '3',
    tittle: 'Building Responsive Web Designs',
    content: 'Responsive web design is crucial in today\'s multi-device world. Learn how to create websites that look great on all screen sizes using modern CSS techniques like Flexbox, Grid, and media queries. We\'ll cover mobile-first design principles and best practices for creating fluid, adaptable layouts.',
    slug: 'building-responsive-web-designs',
    author: {
      firstName: 'Mike',
      lastName: 'Johnson',
      username: 'mikejohnson',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop'
    },
    category: { name: 'Design', slug: 'design' },
    featureImages: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=400&fit=crop',
    likeCount: 156,
    commentCount: 45,
    readCount: 5670,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'public'
  },
  {
    _id: '4',
    tittle: 'Understanding JavaScript Closures',
    content: 'Closures are one of the most powerful features of JavaScript, yet they can be confusing for many developers. A closure gives you access to an outer function\'s scope from an inner function. In this deep dive, we\'ll explore how closures work, when to use them, and common patterns.',
    slug: 'understanding-javascript-closures',
    author: {
      firstName: 'Sarah',
      lastName: 'Williams',
      username: 'sarahwilliams',
      profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    category: { name: 'Programming', slug: 'programming' },
    featureImages: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    likeCount: 203,
    commentCount: 67,
    readCount: 8920,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'public'
  },
  {
    _id: '5',
    tittle: 'Introduction to Node.js and Express',
    content: 'Node.js has become the go-to platform for building server-side applications with JavaScript. Combined with Express, it provides a powerful framework for creating RESTful APIs and web applications. This tutorial will guide you through setting up your first Node.js server and building a simple API.',
    slug: 'introduction-to-nodejs-and-express',
    author: {
      firstName: 'David',
      lastName: 'Brown',
      username: 'davidbrown',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop'
    },
    category: { name: 'Technology', slug: 'technology' },
    featureImages: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
    likeCount: 178,
    commentCount: 34,
    readCount: 4560,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'public'
  },
  {
    _id: '6',
    tittle: 'CSS Grid vs Flexbox: When to Use What',
    content: 'Both CSS Grid and Flexbox are powerful layout tools, but they serve different purposes. Flexbox is great for one-dimensional layouts, while Grid excels at two-dimensional layouts. Learn when to use each and how to combine them for the best results in your web projects.',
    slug: 'css-grid-vs-flexbox-when-to-use-what',
    author: {
      firstName: 'Emily',
      lastName: 'Davis',
      username: 'emilydavis',
      profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
    },
    category: { name: 'Design', slug: 'design' },
    featureImages: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=400&fit=crop',
    likeCount: 134,
    commentCount: 28,
    readCount: 3890,
    createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    visibility: 'public'
  }
]

const HomePage = () => {
  const [blogs, setBlogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [useSampleData, setUseSampleData] = useState(false)
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
        setUseSampleData(false)
      } else {
        // If no blogs from API, use sample data
        setBlogs(sampleBlogs)
        setUseSampleData(true)
      }
    } catch (err) {
      // On error, use sample data
      console.error('Error fetching blogs:', err)
      setBlogs(sampleBlogs)
      setUseSampleData(true)
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
       {/* <div className="mb-12 text-center">
         <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
           Discover stories, thinking, and expertise
         </h1>
         <p className="text-xl text-gray-600 max-w-2xl mx-auto">
           Explore articles from writers on any topic
         </p>
       </div> */}

      {/* Sample Data Notice */}
      {useSampleData && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-blue-700 dark:text-blue-300 text-sm text-center">
            📝 Showing sample blogs. Connect to your backend to see real data.
          </p>
        </div>
      )}

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
              onClick={() => navigate(`/blog/${blog.slug}`)}
            >
              <div className={`flex flex-col ${blog.featureImages ? 'md:flex-row' : ''} gap-6 w-full`}>
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
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3 hover:text-gray-700 dark:hover:text-gray-300 transition break-words">
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