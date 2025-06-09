const express = require("express");
const { body } = require("express-validator");
const {
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
} = require("../controllers/postController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Post validation
const postValidation = [
  body("title")
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage("Title must be between 5 and 100 characters"),
  body("content")
    .trim()
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters long"),
  body("excerpt")
    .optional()
    .trim()
    .isLength({ max: 300 })
    .withMessage("Excerpt cannot be more than 300 characters"),
  body("category")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Category must be between 2 and 50 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Status must be draft, published, or archived"),
];

// Public routes
router.get("/", getPosts);
router.get("/slug/:slug", getPostBySlug);
router.get("/:id", getPost);

// Private routes
router.use(protect);

// User routes
router.get("/user/my-posts", getMyPosts);
router.post("/", postValidation, createPost);
router.put("/:id", postValidation, updatePost);
router.delete("/:id", deletePost);
router.put("/:id/like", likePost);
router.post("/:id/comments", addComment);
router.delete("/:id/comments/:commentId", deleteComment);

module.exports = router;
