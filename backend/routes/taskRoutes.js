const express = require("express");
const Task = require("../models/Task");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch {
    res.status(500).json({ message: "Could not fetch tasks" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title?.trim()) {
      return res.status(400).json({ message: "Task title is required" });
    }

    const task = await Task.create({
      title: title.trim(),
      description,
      status,
      priority,
      dueDate: dueDate || null,
      user: req.user._id
    });

    res.status(201).json(task);
  } catch {
    res.status(500).json({ message: "Could not create task" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch {
    res.status(500).json({ message: "Could not update task" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id
    });

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted successfully" });
  } catch {
    res.status(500).json({ message: "Could not delete task" });
  }
});

module.exports = router;
