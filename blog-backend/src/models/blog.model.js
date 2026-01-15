import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  
    tittle: {
        type: String,
        required: true,
    },  
    content: {
        type: String,
        required: true,
    },
    featureImages:{
        type:String,
    },
    slug:{
        type: String,
        required: true,
        unique: true,
    },
    visibility:{
        type: String,
        enum: ['public', 'private'],
        default: 'public',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'BlogCategories'
    },
    likeCount: {
        type: Number,
        default: 0,
        index: true, // Index for trending queries
    },
    commentCount: {
        type: Number,
        default: 0,
        index: true, // Index for trending queries
    },
    shareCount: {
        type: Number,
        default: 0,
    },
    readCount: {
        type: Number,
        default: 0,
        index: true, // Index for trending queries
    },
    // Cached trending score (updated periodically)
    trendingScore: {
        type: Number,
        default: 0,
        index: true, // Index for fast sorting
    },
    // Track when trending score was last calculated
    trendingScoreUpdatedAt: {
        type: Date,
        default: Date.now,
    },

    createdAt: {
        type: Date, 
        default: Date.now,
        index: true, // Index for time-based queries
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Compound index for trending queries (visibility + createdAt + trendingScore)
blogSchema.index({ visibility: 1, createdAt: -1, trendingScore: -1 });

// Compound index for category-based trending
blogSchema.index({ category: 1, visibility: 1, trendingScore: -1 });


const blogModel = mongoose.model("Blog", blogSchema);

export default blogModel;
