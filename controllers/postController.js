const { validationResult } = require("express-validator");
const Post = require("../models/Post");
const User = require("../models/User");
const { ErrorResponse } = require("../middlewares/errorHandler");

// @desc    Get all posts
// @route   GET /api/v1/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { status: "published" };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by tags
    if (req.query.tags) {
      const tags = req.query.tags.split(",");
      query.tags = { $in: tags };
    }

    // Search in title and content
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }

    // Filter by author
    if (req.query.author) {
      query.author = req.query.author;
    }

    // Sort options
    let sortOptions = { publishedAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case "oldest":
          sortOptions = { publishedAt: 1 };
          break;
        case "popular":
          sortOptions = { views: -1 };
          break;
        case "liked":
          sortOptions = { "likes.length": -1 };
          break;
        default:
          sortOptions = { publishedAt: -1 };
      }
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("author", "name avatar bio")
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex)
      .select("-comments"); // Exclude comments for list view

    // Pagination info
    const pagination = {};
    if (startIndex + limit < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      pagination,
      data: {
        posts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single post
// @route   GET /api/v1/posts/:id
// @access  Public
const getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name avatar bio")
      .populate("comments.user", "name avatar");

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Check if post is published or user is owner/admin
    if (
      post.status !== "published" &&
      (!req.user ||
        (req.user.id !== post.author._id.toString() &&
          req.user.role !== "admin"))
    ) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Increment views if not the author
    if (!req.user || req.user.id !== post.author._id.toString()) {
      post.views += 1;
      await post.save();
    }

    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get post by slug
// @route   GET /api/v1/posts/slug/:slug
// @access  Public
const getPostBySlug = async (req, res, next) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug })
      .populate("author", "name avatar bio")
      .populate("comments.user", "name avatar");

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Check if post is published or user is owner/admin
    if (
      post.status !== "published" &&
      (!req.user ||
        (req.user.id !== post.author._id.toString() &&
          req.user.role !== "admin"))
    ) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Increment views if not the author
    if (!req.user || req.user.id !== post.author._id.toString()) {
      post.views += 1;
      await post.save();
    }

    res.status(200).json({
      success: true,
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new post
// @route   POST /api/v1/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    // Add author to req.body
    req.body.author = req.user.id;

    const post = await Post.create(req.body);

    // Populate author info
    await post.populate("author", "name avatar");

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post
// @route   PUT /api/v1/posts/:id
// @access  Private
const updatePost = async (req, res, next) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Check if user is owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to update this post", 403));
    }

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("author", "name avatar");

    res.status(200).json({
      success: true,
      message: "Post updated successfully",
      data: {
        post,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete post
// @route   DELETE /api/v1/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Check if user is owner or admin
    if (post.author.toString() !== req.user.id && req.user.role !== "admin") {
      return next(new ErrorResponse("Not authorized to delete this post", 403));
    }

    await Post.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike post
// @route   PUT /api/v1/posts/:id/like
// @access  Private
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    // Check if post is already liked by user
    const isLiked = post.likes.some(
      (like) => like.user.toString() === req.user.id
    );

    if (isLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        (like) => like.user.toString() !== req.user.id
      );
    } else {
      // Like the post
      post.likes.push({ user: req.user.id });
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: isLiked ? "Post unliked" : "Post liked",
      data: {
        likesCount: post.likes.length,
        isLiked: !isLiked,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add comment to post
// @route   POST /api/v1/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return next(new ErrorResponse("Comment text is required", 400));
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    const newComment = {
      user: req.user.id,
      text: text.trim(),
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment
    await post.populate("comments.user", "name avatar");

    const addedComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: {
        comment: addedComment,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete comment
// @route   DELETE /api/v1/posts/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return next(new ErrorResponse("Post not found", 404));
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return next(new ErrorResponse("Comment not found", 404));
    }

    // Check if user is comment owner or admin
    if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return next(
        new ErrorResponse("Not authorized to delete this comment", 403)
      );
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my posts
// @route   GET /api/v1/posts/my-posts
// @access  Private
const getMyPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;

    // Build query
    let query = { author: req.user.id };

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate("author", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(startIndex);

    res.status(200).json({
      success: true,
      count: posts.length,
      total,
      data: {
        posts,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPost,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  likePost,
  addComment,
  deleteComment,
  getMyPosts,
};
