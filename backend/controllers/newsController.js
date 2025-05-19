const News = require('../models/News');
const path = require('path');
const fs = require('fs');

// Generate a slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/-+/g, '-') // Replace multiple dashes with single dash
    .concat('-', Date.now().toString().slice(-6)); // Add timestamp to ensure uniqueness
}

// Get all news with pagination and filters
exports.getAllNews = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, featured, trending, search } = req.query;
    
    const query = {};
    
    // Apply filters if provided
    if (category) query.category = category;
    if (featured === 'true') query.featured = true;
    if (trending === 'true') query.trending = true;
    
    // Apply text search if provided
    if (search) {
      query.$text = { $search: search };
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { publishDate: -1 }, // Sort by publish date descending
    };
    
    const news = await News.find(query)
      .skip((options.page - 1) * options.limit)
      .limit(options.limit)
      .sort(options.sort);
    
    const total = await News.countDocuments(query);
    
    res.json({
      news,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      totalNews: total,
    });
  } catch (error) {
    console.error('Get all news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get featured news
exports.getFeaturedNews = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    
    const news = await News.find({ featured: true })
      .limit(parseInt(limit, 10))
      .sort({ publishDate: -1 });
    
    res.json(news);
  } catch (error) {
    console.error('Get featured news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get trending news
exports.getTrendingNews = async (req, res) => {
  try {
    // const { limit = 6 } = req.query; // Original limit
    const limit = 5; // Fetch top 5 for engagement

    const news = await News.aggregate([
      {
        $addFields: {
          engagement: { $add: ['$likes', '$dislikes', '$views'] } // Calculate engagement score
        }
      },
      {
        $sort: { engagement: -1 } // Sort by engagement descending
      },
      {
        $limit: parseInt(limit, 10)
      }
    ]);

    // The result of aggregation is an array of plain objects, not Mongoose documents.
    // If you need Mongoose documents, you might need to fetch them again by ID,
    // or ensure all necessary fields are projected in the aggregation.
    // For this use case, plain objects with all fields should be fine.

    res.json({ news }); // Ensure response structure is consistent if frontend expects { news: [...] }
  } catch (error) {
    console.error('Get trending news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get news by ID or slug
exports.getNewsById = async (req, res) => {
  try {
    const newsId = req.params.id;
    
    // Check if the ID is a MongoDB ObjectId or a slug
    let news;
    if (newsId.match(/^[0-9a-fA-F]{24}$/)) {
      // It's an ObjectId
      news = await News.findById(newsId);
    } else {
      // It's a slug
      news = await News.findOne({ slug: newsId });
    }
    
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Increment view count
    news.views += 1;
    await news.save();
    
    res.json(news);
  } catch (error) {
    console.error('Get news by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new news article
exports.createNews = async (req, res) => {
  try {
    console.log("createNews req.body:", req.body); // Added log
    console.log("createNews req.file:", req.file); // Added log

    const { title, subtitle, content, author, category, tags, featured, trending, summary, date } = req.body; // Added summary and date

    let imageUrl = '';
    
    // Handle file upload if provided
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }
    
    const slug = generateSlug(title);
    
    const news = new News({
      title,
      subtitle: subtitle || '',
      summary: summary || '', // Added summary
      content,
      author,
      imageUrl,
      category: category || 'General',
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [], // Filter out empty tags
      featured: String(featured).toLowerCase() === 'true',
      trending: String(trending).toLowerCase() === 'true',
      publishDate: date ? new Date(date) : new Date(), // Use provided date or default to now
      slug,
    });
    
    const savedNews = await news.save();
    console.log("createNews savedNews (before sending response):", savedNews); // Added log
    res.status(201).json(savedNews);
  } catch (error) {
    console.error('Create news error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update news article
exports.updateNews = async (req, res) => {
  try {
    console.log("updateNews req.body:", req.body); // Added log
    console.log("updateNews req.file:", req.file); // Added log

    const { title, subtitle, content, author, category, tags, featured, trending, summary, date } = req.body;
    
    const newsToUpdate = await News.findById(req.params.id);
    
    if (!newsToUpdate) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Handle file upload if provided
    if (req.file) {
      // Delete old image if it exists
      if (newsToUpdate.imageUrl) {
        const oldImagePath = path.join(__dirname, '..', newsToUpdate.imageUrl);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      
      newsToUpdate.imageUrl = `/uploads/${req.file.filename}`;
    }
    
    // Update fields
    newsToUpdate.title = title !== undefined ? title : newsToUpdate.title;
    newsToUpdate.subtitle = subtitle !== undefined ? subtitle : newsToUpdate.subtitle;
    newsToUpdate.summary = summary !== undefined ? summary : newsToUpdate.summary;
    newsToUpdate.content = content !== undefined ? content : newsToUpdate.content;
    newsToUpdate.author = author !== undefined ? author : newsToUpdate.author;
    newsToUpdate.category = category !== undefined ? category : newsToUpdate.category;
    
    if (date) {
        // Ensure we are updating the correct date field, which is publishDate in the model
        newsToUpdate.publishDate = new Date(date);
    }

    if (tags !== undefined) { // Ensure tags can be cleared or updated
      if (typeof tags === 'string') {
        newsToUpdate.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag); // Filter out empty tags
      } else if (Array.isArray(tags)) {
        newsToUpdate.tags = tags.filter(tag => tag); // Filter out empty tags if sent as array
      }
    }
    
    if (featured !== undefined) {
      newsToUpdate.featured = String(featured).toLowerCase() === 'true';
    }
    
    if (trending !== undefined) {
      newsToUpdate.trending = String(trending).toLowerCase() === 'true';
    }
    
    // Update slug only if title is changed and the new title is not empty
    if (title && title !== newsToUpdate.title) {
      newsToUpdate.slug = generateSlug(title);
    }
    
    newsToUpdate.updatedAt = new Date(); // Explicitly set updatedAt
    
    const updatedNews = await newsToUpdate.save();
    console.log("updateNews updatedNews (before sending response):", updatedNews); // Added log
    res.json(updatedNews);
  } catch (error) {
    console.error('Update news error:', error); // Keep this detailed log for the backend console
    if (error.name === 'ValidationError') {
      // Send back specific Mongoose validation errors
      return res.status(400).json({ 
        message: 'Validation failed. Please check your input.', 
        errors: error.errors 
      });
    }
    // For other types of errors, send a generic 500 response with some detail
    res.status(500).json({ message: 'Server error occurred. Please try again later.', errorDetails: error.message });
  }
};

// Delete news article
exports.deleteNews = async (req, res) => {
  try {
    const newsToDelete = await News.findById(req.params.id);
    
    if (!newsToDelete) {
      return res.status(404).json({ message: 'News not found' });
    }
    
    // Delete associated image if it exists
    if (newsToDelete.imageUrl) {
      const imagePath = path.join(__dirname, '..', newsToDelete.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await News.findByIdAndDelete(req.params.id);
    res.json({ message: 'News deleted successfully' });
  } catch (error) {
    console.error('Delete news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Like a news article
exports.likeNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    const { previousAction } = req.body;

    // Handle different previous actions
    if (previousAction === 'disliked') {
      // User is switching from dislike to like
      news.likes = (news.likes || 0) + 1;
      news.dislikes = Math.max(0, (news.dislikes || 0) - 1); // Ensure dislikes don't go below 0
    } else if (previousAction === 'liked') {
      // User already liked - this shouldn't happen with proper frontend validation
      // but we'll handle it anyway
      return res.json(news);
    } else {
      // New like (no previous action)
      news.likes = (news.likes || 0) + 1;
    }

    await news.save();
    res.json(news); // Return the full updated news object
  } catch (error) {
    console.error('Like news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Dislike a news article
exports.dislikeNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News not found' });
    }
    const { previousAction } = req.body;

    // Handle different previous actions
    if (previousAction === 'liked') {
      // User is switching from like to dislike
      news.dislikes = (news.dislikes || 0) + 1;
      news.likes = Math.max(0, (news.likes || 0) - 1); // Ensure likes don't go below 0
    } else if (previousAction === 'disliked') {
      // User already disliked - this shouldn't happen with proper frontend validation
      // but we'll handle it anyway
      return res.json(news);
    } else {
      // New dislike (no previous action)
      news.dislikes = (news.dislikes || 0) + 1;
    }
    
    await news.save();
    res.json(news); // Return the full updated news object
  } catch (error) {
    console.error('Dislike news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get latest news
exports.getLatestNews = async (req, res) => {
  try {
    const news = await News.find()
      .sort({ publishDate: -1 })
      .limit(5); // Adjust the limit as needed
    
    res.json(news);
  } catch (error) {
    console.error('Get latest news error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
