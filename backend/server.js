const express = require("express");
const multer = require("multer");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.static("uploads"));
app.use(bodyParser.json());

// Fayllarni uploads/ ga saqlash
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage });

// POST joylash (bir nechta fayl qabul qilamiz)
app.post("/api/posts", upload.array("media"), (req, res) => {
  let posts = [];

  try {
    const data = fs.readFileSync("posts.json", "utf-8");
    posts = JSON.parse(data || "[]");
  } catch (err) {
    posts = [];
  }

  const { name, text } = req.body;

  const mediaFiles = req.files.map(file => ({
    filename: file.filename,
    type: file.mimetype,
  }));

  const newPost = {
    id: Date.now(),
    name,
    text,
    media: mediaFiles,
    likes: 0,
    comments: [],
    createdAt: new Date(),
  };

  posts.unshift(newPost);
  fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
  res.json({ success: true, post: newPost });
});

// Barcha postlarni olish
app.get("/api/posts", (req, res) => {
  try {
    const data = fs.readFileSync("posts.json", "utf-8");
    const posts = JSON.parse(data || "[]");
    res.json(posts);
  } catch (err) {
    res.json([]);
  }
});

// Like qo‘shish
app.post("/api/posts/:id/like", (req, res) => {
  const id = parseInt(req.params.id);
  const posts = JSON.parse(fs.readFileSync("posts.json", "utf-8"));
  const post = posts.find(p => p.id === id);
  if (post) {
    post.likes += 1;
    fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Post topilmadi" });
  }
});

// Komment qo‘shish
app.post("/api/posts/:id/comment", (req, res) => {
  const id = parseInt(req.params.id);
  const { comment } = req.body;
  const posts = JSON.parse(fs.readFileSync("posts.json", "utf-8"));
  const post = posts.find(p => p.id === id);
  if (post) {
    post.comments.push(comment);
    fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Post topilmadi" });
  }
});

// POST O‘CHIRISH — Admin panel uchun
app.delete("/api/posts/:id", (req, res) => {
    const id = parseInt(req.params.id);
    let posts = [];
  
    try {
      posts = JSON.parse(fs.readFileSync("posts.json", "utf-8"));
      posts = posts.filter(post => post.id !== id);
      fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
      res.json({ success: true });
    } catch (e) {
      res.status(500).json({ error: "Postni o‘chirishda xatolik" });
    }
  });  

// Frontend fayllarini serve qilish
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Serverni ishga tushirish
app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
});
