import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createBlogAPI, getAllCategoriesAPI } from "../api/blog.api";
import useAuth from "../hooks/useAuth";
import { useTheme } from "../context/ThemeContext";
import { 
  FiEdit3, 
  FiImage, 
  FiX, 
  FiSave, 
  FiEye, 
  FiEyeOff,
  FiLoader,
  FiAlertCircle
} from "react-icons/fi";
import { useToast } from "../context/ToastContext";

const WriteBlogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    tittle: "",
    content: "",
    slug: "",
    category: "",
    visibility: "public",
    featureImages: null,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await getAllCategoriesAPI();
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Auto-generate slug from title
    if (name === "tittle") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setFormData({
        ...formData,
        featureImages: file,
      });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData({
      ...formData,
      featureImages: null,
    });
    setImagePreview(null);
  };

  const validateForm = () => {
    if (!formData.tittle.trim()) {
      toast.error("Title is required");
      return false;
    }
    if (formData.tittle.length < 5) {
      toast.error("Title must be at least 5 characters");
      return false;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return false;
    }
    if (formData.content.length < 50) {
      toast.error("Content must be at least 50 characters");
      return false;
    }
    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return false;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const form = new FormData();
      form.append("tittle", formData.tittle);
      form.append("content", formData.content);
      form.append("slug", formData.slug);
      form.append("category", formData.category);
      form.append("visibility", formData.visibility);
      
      if (formData.featureImages) {
        form.append("featureImages", formData.featureImages);
      }

      const response = await createBlogAPI(form);
      
      if (response.status === "success" || response.success) {
        toast.success("Blog created successfully!");
        setTimeout(() => {
          navigate("/profile");
        }, 1500);
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 
        err.message || 
        "Failed to create blog. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 px-4 sm:px-6 lg:px-8 py-8 transition-colors w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Write a new story
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Share your thoughts, ideas, and experiences with the world
        </p>
      </div>


      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="tittle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title *
          </label>
          <input
            id="tittle"
            name="tittle"
            type="text"
            value={formData.tittle}
            onChange={handleChange}
            placeholder="Enter your blog title..."
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent transition text-lg"
            disabled={loading}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.tittle.length}/200 characters
          </p>
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            URL Slug *
          </label>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 dark:text-gray-400 text-sm">medium.com/blog/</span>
            <input
              id="slug"
              name="slug"
              type="text"
              value={formData.slug}
              onChange={handleChange}
              placeholder="url-slug"
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent transition"
              disabled={loading}
              required
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Auto-generated from title. You can edit it.
          </p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Content *
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your story here..."
            rows={15}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-gray-900 placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent transition resize-y min-h-[300px]"
            disabled={loading}
            required
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {formData.content.length} characters (minimum 50)
          </p>
        </div>

        {/* Category and Visibility */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 dark:text-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:border-transparent transition"
              disabled={loading}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Visibility */}
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Visibility
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={formData.visibility === "public"}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 text-black dark:text-gray-300 accent-black dark:accent-gray-300 focus:ring-black dark:focus:ring-gray-400 cursor-pointer"
                />
                <div className="flex items-center space-x-1">
                  <FiEye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Public</span>
                </div>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={formData.visibility === "private"}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-4 h-4 text-black dark:text-gray-300 accent-black dark:accent-gray-300 focus:ring-black dark:focus:ring-gray-400 cursor-pointer"
                />
                <div className="flex items-center space-x-1">
                  <FiEyeOff className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Private</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Feature Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Feature Image (Optional)
          </label>
          {imagePreview ? (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-64 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FiImage className="w-10 h-10 text-gray-400 dark:text-gray-500 mb-2" />
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 5MB</p>
              </div>
              <input
                type="file"
                name="featureImages"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={loading}
              />
            </label>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 bg-black dark:bg-gray-200 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-gray-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <FiLoader className="animate-spin h-5 w-5" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <FiSave className="w-5 h-5" />
                <span>Publish</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WriteBlogPage;

