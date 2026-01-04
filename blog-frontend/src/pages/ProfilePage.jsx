import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { 
  getUserBlogsAPI, 
  getUserLikedPostsAPI, 
  getUserCommentsAPI 
} from "../api/blog.api";
import { 
  FiUser, 
  FiEdit3, 
  FiHeart, 
  FiMessageCircle, 
  FiFileText,
  FiClock,
  FiEye,
  FiTrash2,
  FiArrowLeft,
  FiSettings
} from "react-icons/fi";

const ProfilePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [myPosts, setMyPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
    totalViews: 0
  });

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "posts") {
        const response = await getUserBlogsAPI();
        if (response.success) {
          setMyPosts(response.data || []);
        }
      } else if (activeTab === "liked") {
        const response = await getUserLikedPostsAPI();
        if (response.success) {
          setLikedPosts(response.data || []);
        }
      } else if (activeTab === "comments") {
        const response = await getUserCommentsAPI();
        if (response.success) {
          setComments(response.data || []);
        }
      }
      
      // Fetch all data for stats
      const [postsRes, likedRes, commentsRes] = await Promise.all([
        getUserBlogsAPI(),
        getUserLikedPostsAPI(),
        getUserCommentsAPI()
      ]);

      const posts = postsRes.success ? postsRes.data || [] : [];
      const totalViews = posts.reduce((sum, post) => sum + (post.readCount || 0), 0);
      const totalLikes = posts.reduce((sum, post) => sum + (post.likeCount || 0), 0);

      setStats({
        totalPosts: posts.length,
        totalLikes: totalLikes,
        totalComments: commentsRes.success ? (commentsRes.data || []).length : 0,
        totalViews: totalViews
      });
    } catch (error) {
      console.error("Error fetching profile data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const tabs = [
    { id: "posts", label: "My Posts", icon: FiFileText, count: stats.totalPosts },
    { id: "liked", label: "Liked", icon: FiHeart, count: likedPosts.length },
    { id: "comments", label: "Comments", icon: FiMessageCircle, count: stats.totalComments },
  ];

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to view your profile</p>
          <button
            onClick={() => navigate("/login")}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dark:bg-gray-900  max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back button  */}
      <button
        onClick={() => navigate(-1)}
        className="mb-4 text-gray-600 hover:text-gray-900 flex items-center space-x-2"  
      >
        <FiArrowLeft className="w-4 h-4" /> 
        <span>Back</span>
      </button>

      {/* Profile Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Profile Image */}
          <div className="relative dark:text-white">
            {user.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.username}
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                <FiUser className="w-16 h-16 text-gray-400" />
              </div>
            )}
            <button
              onClick={() => navigate("/settings")}
              className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full hover:bg-gray-800 transition"
              title="Edit profile"
            >
              <FiSettings className="w-4 h-4" />
            </button>
          </div>

          {/* User Info */}
          <div className="flex-1 text-center md:text-left ">
            <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
              {user.firstName} {user.lastName}
            </h1>
            <p className=" dark:text-white text-gray-600 mb-4">@{user.username}</p>
            <p className="dark:text-white text-gray-500 text-sm mb-4">{user.email}</p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold dark:text-white text-gray-900">{stats.totalPosts}</div>
                <div className="text-sm dark:text-white text-gray-600">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold dark:text-white text-gray-900">{stats.totalLikes}</div>
                <div className="text-sm dark:text-white text-gray-600">Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold dark:text-white   text-gray-900">{stats.totalComments}</div>
                <div className="text-sm dark:text-white text-gray-600">Comments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold dark:text-white text-gray-900">{stats.totalViews}</div>
                <div className="text-sm dark:text-white text-gray-600">Views</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <>
            {/* My Posts Tab */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {myPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No posts yet</p>
                    <p className="text-gray-400 mb-4">Start writing to share your thoughts!</p>
                    <button
                      onClick={() => navigate("/write")}
                      className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition inline-flex items-center space-x-2"
                    >
                      <FiEdit3 className="w-5 h-5" />
                      <span>Write your first post</span>
                    </button>
                  </div>
                ) : (
                  myPosts.map((post) => (
                    <article
                      key={post._id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <FiClock className="w-4 h-4" />
                              <span>{formatDate(post.createdAt)}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => navigate(`/blog/${post.slug}/edit`)}
                                className="text-gray-600 hover:text-black transition"
                                title="Edit"
                              >
                                <FiEdit3 className="w-5 h-5" />
                              </button>
                              <button
                                className="text-red-600 hover:text-red-700 transition"
                                title="Delete"
                              >
                                <FiTrash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                          <h3
                            className="text-2xl font-bold text-gray-900 mb-2 cursor-pointer hover:text-gray-700 transition"
                            onClick={() => navigate(`/blog/${post.slug}`)}
                          >
                            {post.tittle}
                          </h3>
                          <p className="text-gray-600 mb-4">{truncateContent(post.content)}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {post.category && (
                              <span className="px-3 py-1 bg-gray-100 rounded-full">
                                {post.category.name}
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <FiHeart className="w-4 h-4" />
                              <span>{post.likeCount || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FiMessageCircle className="w-4 h-4" />
                              <span>{post.commentCount || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FiEye className="w-4 h-4" />
                              <span>{post.readCount || 0}</span>
                            </span>
                          </div>
                        </div>
                        {post.featureImages && (
                          <div className="md:w-48 flex-shrink-0">
                            <img
                              src={post.featureImages}
                              alt={post.tittle}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Liked Posts Tab */}
            {activeTab === "liked" && (
              <div className="space-y-6">
                {likedPosts.length === 0 ? (
                  <div className="text-center py-12">
                    <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No liked posts yet</p>
                    <p className="text-gray-400">Posts you like will appear here</p>
                  </div>
                ) : (
                  likedPosts.map((post) => (
                    <article
                      key={post._id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition cursor-pointer"
                      onClick={() => navigate(`/blog/${post.slug}`)}
                    >
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3 text-sm text-gray-600">
                            {post.author?.profilePhoto ? (
                              <img
                                src={post.author.profilePhoto}
                                alt={post.author.username}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-gray-300"></div>
                            )}
                            <span>{post.author?.firstName} {post.author?.lastName}</span>
                            <span>•</span>
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {post.tittle}
                          </h3>
                          <p className="text-gray-600 mb-4">{truncateContent(post.content)}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {post.category && (
                              <span className="px-3 py-1 bg-gray-100 rounded-full">
                                {post.category.name}
                              </span>
                            )}
                            <span className="flex items-center space-x-1">
                              <FiHeart className="w-4 h-4" />
                              <span>{post.likeCount || 0}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <FiMessageCircle className="w-4 h-4" />
                              <span>{post.commentCount || 0}</span>
                            </span>
                          </div>
                        </div>
                        {post.featureImages && (
                          <div className="md:w-48 flex-shrink-0">
                            <img
                              src={post.featureImages}
                              alt={post.tittle}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* Comments Tab */}
            {activeTab === "comments" && (
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center py-12">
                    <FiMessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No comments yet</p>
                    <p className="text-gray-400">Comments you make will appear here</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition"
                    >
                      <div className="flex items-start space-x-4">
                        {comment.user?.profilePhoto ? (
                          <img
                            src={comment.user.profilePhoto}
                            alt={comment.user.username}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <FiUser className="w-6 h-6 text-gray-600" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="font-semibold text-gray-900">
                              {comment.user?.firstName} {comment.user?.lastName}
                            </span>
                            <span className="text-gray-400">•</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{comment.content}</p>
                          {comment.postId && (
                            <div
                              className="border-t border-gray-100 pt-3 mt-3 cursor-pointer hover:bg-gray-50 p-3 rounded transition"
                              onClick={() => navigate(`/blog/${comment.postId.slug}`)}
                            >
                              <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <FiFileText className="w-4 h-4" />
                                <span className="font-medium">On: {comment.postId.tittle}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
