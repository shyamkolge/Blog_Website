import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getBlogBySlugAPI, 
  toggleLikeAPI, 
  checkUserLikedAPI,
  addCommentAPI,
  getBlogCommentsAPI,
  deleteCommentAPI
} from "../api/blog.api";
import useAuth from "../hooks/useAuth";
import { useToast } from "../context/ToastContext";
import {
  FiClock,
  FiUser,
  FiHeart,
  FiMessageCircle,
  FiEye,
  FiShare2,
  FiArrowLeft,
  FiTag,
  FiSend,
  FiTrash2,
  FiLoader,
} from "react-icons/fi";

const BlogReadPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [liking, setLiking] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    fetchBlog();
  }, [slug]);

  useEffect(() => {
    if (blog && user) {
      checkLikeStatus();
    }
    if (blog) {
      fetchComments();
    }
    
    // Scroll to comments section if hash is present
    if (window.location.hash === '#comments') {
      setTimeout(() => {
        const commentsSection = document.getElementById('comments-section');
        if (commentsSection) {
          commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 500);
    }
  }, [blog, user]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await getBlogBySlugAPI(slug);
      if (response.success) {
        setBlog(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Blog not found");
    } finally {
      setLoading(false);
    }
  };

  const checkLikeStatus = async () => {
    if (!blog) return;
    try {
      const response = await checkUserLikedAPI(blog._id);
      if (response.success) {
        setIsLiked(response.data.liked || false);
      }
    } catch (err) {
      // If user is not logged in, that's fine - just set liked to false
      setIsLiked(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.warning("Please log in to like blogs");
      navigate("/login");
      return;
    }

    setLiking(true);
    try {
      const response = await toggleLikeAPI(blog._id);
      if (response.success) {
        setIsLiked(response.data.isLiked);
        setBlog(prev => ({
          ...prev,
          likeCount: response.data.likeCount
        }));
        toast.success(response.data.isLiked ? "Blog liked!" : "Blog unliked");
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      toast.error(err.response?.data?.message || "Failed to like blog");
    } finally {
      setLiking(false);
    }
  };

  const fetchComments = async () => {
    if (!blog) return;
    setLoadingComments(true);
    try {
      const response = await getBlogCommentsAPI(blog._id);
      if (response.success) {
        setComments(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.warning("Please log in to comment");
      navigate("/login");
      return;
    }

    if (!newComment.trim()) {
      toast.warning("Please enter a comment");
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await addCommentAPI(blog._id, newComment);
      if (response.success) {
        setComments(prev => [response.data, ...prev]);
        setNewComment("");
        setBlog(prev => ({
          ...prev,
          commentCount: (prev.commentCount || 0) + 1
        }));
        toast.success("Comment added successfully!");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error(err.response?.data?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      const response = await deleteCommentAPI(commentId);
      if (response.success) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
        setBlog(prev => ({
          ...prev,
          commentCount: Math.max(0, (prev.commentCount || 0) - 1)
        }));
        toast.success("Comment deleted successfully");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error(err.response?.data?.message || "Failed to delete comment");
    }
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleShare = async () => {
    if (!blog) return;
    
    const blogUrl = `${window.location.origin}/blog/${blog.slug}`;
    const shareData = {
      title: blog.tittle,
      text: truncateContent(blog.content, 100),
      url: blogUrl,
    };

    try {
      // Check if Web Share API is supported (mobile devices)
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        try {
          await navigator.clipboard.writeText(blogUrl);
          toast.success("Link copied to clipboard!");
        } catch (clipboardErr) {
          // Final fallback: Show URL in prompt
          prompt("Copy this link:", blogUrl);
        }
      }
    } catch (err) {
      // User cancelled share (AbortError) - do nothing
      if (err.name !== 'AbortError') {
        // Other error - try clipboard fallback
        try {
          await navigator.clipboard.writeText(blogUrl);
          toast.success("Link copied to clipboard!");
        } catch (clipboardErr) {
          console.error("Error sharing:", clipboardErr);
          toast.error("Failed to share blog");
          prompt("Copy this link:", blogUrl);
        }
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatReadingTime = (content) => {
    if (!content) return "1 min read";
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return `${readingTime} min read`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Blog not found"}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition mb-6"
      >
        <FiArrowLeft className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Article Header */}
      <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
        {/* Feature Image */}
        {blog.featureImages && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img
              src={blog.featureImages}
              alt={blog.tittle}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-10">
          {/* Category */}
          {blog.category && (
            <div className="mb-4">
              <span className="inline-flex items-center space-x-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                <FiTag className="w-4 h-4" />
                <span>{blog.category.name}</span>
              </span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            {blog.tittle}
          </h1>

          {/* Author Info & Meta */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              {blog.author?.profilePhoto ? (
                <img
                  src={blog.author.profilePhoto}
                  alt={blog.author.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                  <FiUser className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  {blog.author?.firstName} {blog.author?.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">@{blog.author?.username}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <FiClock className="w-4 h-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </span>
              <span>•</span>
              <span>{formatReadingTime(blog.content)}</span>
            </div>
          </div>

          {/* Blog Content */}
          <div className="prose prose-lg max-w-none">
            <div
              className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap"
              style={{
                fontFamily: "Georgia, serif",
                lineHeight: "1.8",
                fontSize: "1.125rem",
              }}
            >
              {blog.content.split("\n").map((paragraph, index) => (
                <p key={index} className="mb-6">
                  {paragraph || "\u00A0"}
                </p>
              ))}
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-6 text-gray-600 dark:text-gray-400">
                <button 
                  onClick={handleLike}
                  disabled={liking || !user}
                  className={`flex items-center space-x-2 transition ${
                    isLiked 
                      ? 'text-red-600 hover:text-red-700' 
                      : 'hover:text-red-600'
                  } ${!user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {liking ? (
                    <FiLoader className="w-5 h-5 animate-spin" />
                  ) : (
                    <FiHeart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  )}
                  <span>{blog.likeCount || 0}</span>
                </button>
                <div className="flex items-center space-x-2">
                  <FiMessageCircle className="w-5 h-5" />
                  <span>{blog.commentCount || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FiEye className="w-5 h-5" />
                  <span>{blog.readCount || 0}</span>
                </div>
              </div>
              <button 
                onClick={handleShare}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition"
              >
                <FiShare2 className="w-5 h-5" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      

      {/* Comments Section */}
      <div id="comments-section" className="mt-8 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8 transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Comments ({blog.commentCount || 0})
        </h2>

        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="flex items-start space-x-4">
              {user.profilePhoto ? (
                <img
                  src={user.profilePhoto}
                  alt={user.username}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                  <FiUser className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                </div>
              )}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition resize-none"
                  disabled={submittingComment}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Press Enter to submit, Shift+Enter for new line
                  </p>
                  <button
                    type="submit"
                    disabled={!newComment.trim() || submittingComment}
                    className="flex items-center space-x-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? (
                      <>
                        <FiLoader className="w-4 h-4 animate-spin" />
                        <span>Posting...</span>
                      </>
                    ) : (
                      <>
                        <FiSend className="w-4 h-4" />
                        <span>Post</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-2">Please log in to leave a comment</p>
            <button
              onClick={() => navigate("/login")}
              className="text-black dark:text-white hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        )}

        {/* Comments List */}
        {loadingComments ? (
          <div className="flex items-center justify-center py-8">
            <FiLoader className="w-6 h-6 animate-spin text-gray-400 dark:text-gray-500" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FiMessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <div
                key={comment._id}
                className="flex items-start space-x-4 pb-6 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                {comment.user?.profilePhoto ? (
                  <img
                    src={comment.user.profilePhoto}
                    alt={comment.user.username}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0">
                    <FiUser className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(comment.createdAt)}
                      </p>
                    </div>
                    {user && comment.user?._id === user._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition p-1"
                        title="Delete comment"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Posts Section (Optional - can be added later) */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">More from {blog.category?.name}</h2>
        <p className="text-gray-600 dark:text-gray-400">Related posts coming soon...</p>
      </div>
    </div>
  );
};

export default BlogReadPage;

