const express = require("express");
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserPosts,
} = require("../controllers/userController");
const { protect, admin } = require("../middlewares/authMiddleware");

const router = express.Router();

// All routes are protected and require admin access
router.use(protect);

// Public route (with optional auth)
router.get("/:id/posts", getUserPosts);

// Admin only routes
router.get("/", admin, getUsers);
router.get("/:id", admin, getUser);
router.put("/:id", admin, updateUser);
router.delete("/:id", admin, deleteUser);

module.exports = router;
