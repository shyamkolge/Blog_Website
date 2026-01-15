/**
 * Trending Service
 * 
 * Production-grade service for calculating and managing trending scores.
 * Can be used with cron jobs for periodic score updates.
 */

import blogModel from "../models/blog.model.js";

// Scoring configuration
const TRENDING_CONFIG = {
  weights: {
    likes: 3,      // High intent signal
    comments: 5,   // Highest engagement (takes effort)
    shares: 4,     // Viral potential
    reads: 1       // Passive engagement
  },
  halfLifeDays: 3,           // Score halves every 3 days
  timeWindowDays: 7,         // Consider posts from last 7 days
  velocityBonus: 0.1,        // 10% bonus for engagement velocity
  minScoreThreshold: 0.1     // Minimum score to be considered trending
};

/**
 * Calculate trending score for a single blog
 */
export const calculateTrendingScore = (blog) => {
  const { weights, halfLifeDays, velocityBonus } = TRENDING_CONFIG;
  
  // Calculate decay constant
  const decayConstant = Math.log(2) / (halfLifeDays * 24 * 60 * 60 * 1000);
  
  // Calculate age in milliseconds
  const ageMs = Date.now() - new Date(blog.createdAt).getTime();
  
  // Raw engagement score (weighted sum)
  const rawScore = 
    (blog.likeCount || 0) * weights.likes +
    (blog.commentCount || 0) * weights.comments +
    (blog.shareCount || 0) * weights.shares +
    (blog.readCount || 0) * weights.reads;
  
  // Apply time decay (exponential decay)
  const timeDecayedScore = rawScore * Math.exp(-decayConstant * ageMs);
  
  // Calculate velocity (engagement per hour)
  const hoursOld = Math.max(ageMs / 3600000, 1); // At least 1 hour
  const engagementVelocity = rawScore / hoursOld;
  
  // Final score with velocity bonus
  const finalScore = timeDecayedScore + (engagementVelocity * velocityBonus);
  
  return Math.round(finalScore * 1000) / 1000; // Round to 3 decimal places
};

/**
 * Update trending scores for all blogs
 * Use this with a cron job (e.g., every 15 minutes)
 */
export const updateAllTrendingScores = async () => {
  const { timeWindowDays, minScoreThreshold } = TRENDING_CONFIG;
  
  const cutoffDate = new Date(Date.now() - timeWindowDays * 24 * 60 * 60 * 1000);
  
  try {
    // Get all public blogs within time window
    const blogs = await blogModel.find({
      visibility: 'public',
      createdAt: { $gte: cutoffDate }
    });
    
    // Batch update operations
    const bulkOps = blogs.map(blog => ({
      updateOne: {
        filter: { _id: blog._id },
        update: {
          $set: {
            trendingScore: calculateTrendingScore(blog),
            trendingScoreUpdatedAt: new Date()
          }
        }
      }
    }));
    
    // Reset scores for older blogs
    const resetOps = {
      updateMany: {
        filter: {
          visibility: 'public',
          createdAt: { $lt: cutoffDate },
          trendingScore: { $gt: minScoreThreshold }
        },
        update: {
          $set: {
            trendingScore: 0,
            trendingScoreUpdatedAt: new Date()
          }
        }
      }
    };
    
    if (bulkOps.length > 0) {
      await blogModel.bulkWrite([...bulkOps, resetOps]);
    }
    
    console.log(`[TrendingService] Updated ${blogs.length} blog scores`);
    return { updated: blogs.length };
    
  } catch (error) {
    console.error('[TrendingService] Error updating scores:', error);
    throw error;
  }
};

/**
 * Update trending score for a single blog
 * Call this after engagement actions (like, comment, share, read)
 */
export const updateBlogTrendingScore = async (blogId) => {
  try {
    const blog = await blogModel.findById(blogId);
    if (!blog) return null;
    
    const newScore = calculateTrendingScore(blog);
    
    await blogModel.findByIdAndUpdate(blogId, {
      trendingScore: newScore,
      trendingScoreUpdatedAt: new Date()
    });
    
    return newScore;
  } catch (error) {
    console.error(`[TrendingService] Error updating blog ${blogId}:`, error);
    throw error;
  }
};

/**
 * Get trending blogs using cached scores
 * Faster than real-time calculation for high-traffic scenarios
 */
export const getTrendingBlogsFromCache = async (options = {}) => {
  const { 
    limit = 10, 
    page = 1, 
    category = null,
    minScore = TRENDING_CONFIG.minScoreThreshold 
  } = options;
  
  const skip = (page - 1) * limit;
  
  const query = {
    visibility: 'public',
    trendingScore: { $gte: minScore }
  };
  
  if (category) {
    query.category = category;
  }
  
  const blogs = await blogModel
    .find(query)
    .populate('author', 'firstName lastName username profilePhoto email')
    .populate('category', 'name slug')
    .sort({ trendingScore: -1 })
    .skip(skip)
    .limit(limit);
  
  const total = await blogModel.countDocuments(query);
  
  return {
    blogs,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBlogs: total,
      hasMore: skip + blogs.length < total
    }
  };
};

export default {
  calculateTrendingScore,
  updateAllTrendingScores,
  updateBlogTrendingScore,
  getTrendingBlogsFromCache,
  TRENDING_CONFIG
};
