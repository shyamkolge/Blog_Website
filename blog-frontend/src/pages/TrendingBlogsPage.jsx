import React, { useState, useEffect, useCallback } from "react";
import {
  FiTrendingUp,
  FiFilter,
  FiLoader,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import {
  getTrendingBlogsAPI,
  getAllCategoriesAPI,
  toggleLikeAPI,
  checkUserLikedAPI,
} from "../api/blog.api";
import BlogCard from "../components/BlogCard";
import useAuth from "../hooks/useAuth";

const TrendingBlogsPage = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [likedPosts, setLikedPosts] = useState(new Set());

  // Filters and pagination
  const [selectedCategory, setSelectedCategory] = useState("");
  const [timeWindow, setTimeWindow] = useState(7);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    hasMore: false,
  });

  // Fetch trending blogs
  const fetchTrendingBlogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError(null);

        const response = await getTrendingBlogsAPI({
          page,
          limit: 10,
          timeWindow,
          category: selectedCategory || undefined,
        });

        setBlogs(response.data.blogs || []);
        setPagination(
          response.data.pagination || {
            currentPage: page,
            totalPages: 1,
            totalBlogs: 0,
            hasMore: false,
          }
        );

        // Check liked status for each blog if user is logged in
        if (user && response.data.blogs?.length > 0) {
          const likedSet = new Set();
          await Promise.all(
            response.data.blogs.map(async (blog) => {
              try {
                const likeResponse = await checkUserLikedAPI(blog._id);
                if (likeResponse.data?.liked) {
                  likedSet.add(blog._id);
                }
                // eslint-disable-next-line no-unused-vars
              } catch (err) {
                // Ignore individual like check errors
              }
            })
          );
          setLikedPosts(likedSet);
        }
      } catch (err) {
        console.error("Error fetching trending blogs:", err);
        setError("Failed to load trending blogs. Please try again later.");
      } finally {
        setLoading(false);
      }
    },
    [timeWindow, selectedCategory, user]
  );

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getAllCategoriesAPI();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch blogs when filters change
  useEffect(() => {
    fetchTrendingBlogs(1);
  }, [fetchTrendingBlogs]);

  // Handle like toggle
  const handleLikeClick = async (blogId) => {
    if (!user) {
      alert("Please login to like posts");
      return;
    }

    try {
      const response = await toggleLikeAPI(blogId);

      setLikedPosts((prev) => {
        const newSet = new Set(prev);
        if (response.data?.liked) {
          newSet.add(blogId);
        } else {
          newSet.delete(blogId);
        }
        return newSet;
      });

      // Update like count in blogs
      setBlogs((prev) =>
        prev.map((blog) =>
          blog._id === blogId
            ? { ...blog, likeCount: response.data?.likeCount ?? blog.likeCount }
            : blog
        )
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchTrendingBlogs(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Time window options
  const timeWindowOptions = [
    { value: 1, label: "Today" },
    { value: 7, label: "This Week" },
    { value: 30, label: "This Month" },
    { value: 90, label: "Last 3 Months" },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Trending Blogs
          </h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          Discover the most popular and engaging content on our platform
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        {/* Filter Header - Always visible */}
        <div className="flex items-center justify-between mb-4 sm:mb-0">
          <div className="flex items-center gap-2">
            <FiFilter className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
            </span>
          </div>
          
          {/* Results count - Mobile: top right, Desktop: end of row */}
          {!loading && (
            <span className="text-sm text-gray-500 dark:text-gray-400 sm:hidden">
              {pagination.totalBlogs} {pagination.totalBlogs === 1 ? "blog" : "blogs"}
            </span>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-3 sm:mt-0">
          {/* Time Window Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
              Time Period
            </label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(Number(e.target.value))}
              className="w-full sm:w-auto px-3 py-2.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         cursor-pointer"
            >
              {timeWindowOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="text-xs text-gray-500 dark:text-gray-400 sm:hidden">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full sm:w-auto px-3 py-2.5 sm:py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg 
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Results count - Desktop only */}
          {!loading && (
            <span className="hidden sm:block ml-auto text-sm text-gray-500 dark:text-gray-400">
              {pagination.totalBlogs} trending{" "}
              {pagination.totalBlogs === 1 ? "blog" : "blogs"}
            </span>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading trending blogs...
            </p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => fetchTrendingBlogs(pagination.currentPage)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && blogs.length === 0 && (
        <div className="text-center py-20">
          <FiTrendingUp className="text-6xl text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            No trending blogs yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Check back later or try adjusting your filters
          </p>
        </div>
      )}

      {/* Blog List */}
      {!loading && !error && blogs.length > 0 && (
        <div className="space-y-8">
          {blogs.map((blog) => (
            <div key={blog._id} className="relative">
              <BlogCard
                blog={blog}
                isLiked={likedPosts.has(blog._id)}
                onLikeClick={handleLikeClick}
              />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiChevronLeft /> Previous
          </button>

          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>

          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasMore}
            className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                       bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg
                       hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next <FiChevronRight />
          </button>
        </div>
      )}
    </section>
  );
};

export default TrendingBlogsPage;
