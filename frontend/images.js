const imageDiv = document.getElementById("image-posts");

async function loadImages() {
  const res = await fetch("/api/posts");
  const posts = await res.json();
  const imagePosts = posts.filter(
    p => Array.isArray(p.media) && p.media.some(m => m.type && m.type.startsWith("image"))
  );

  imageDiv.innerHTML = "";

  imagePosts.forEach(post => {
    const images = post.media.filter(m => m.type.startsWith("image"));
    const div = document.createElement("div");
    div.className = "image-post";

    div.innerHTML = `
      <div class="image-box">
        ${images.map(img => `
          <img src="http://localhost:3000/${img.filename}" alt="image" />
        `).join("")}
      </div>
      <div class="image-info">
        <strong>📤 ${post.name}</strong> — <small>${new Date(post.createdAt).toLocaleString()}</small>
        <p>${post.text}</p>
        <div class="interaction">
          <button class="like-btn" onclick="likePost(${post.id})">❤️ ${post.likes}</button>
          <button class="toggle-comments" onclick="toggleComments(${post.id})">💬 Kommentlar (${post.comments.length})</button>
        </div>
        <div class="comment-box" id="comments-${post.id}" style="display: none;">
          <input type="text" id="comment-${post.id}" placeholder="Komment yozing..." />
          <button onclick="commentPost(${post.id})">Yuborish</button>
          ${post.comments.map(c => `<div class="comment">${c}</div>`).join("")}
        </div>
      </div>
    `;
    imageDiv.appendChild(div);
  });
}

async function likePost(id) {
  await fetch(`/api/posts/${id}/like`, { method: "POST" });
  loadImages();
}

async function commentPost(id) {
  const input = document.getElementById(`comment-${id}`);
  const comment = input.value;
  if (comment.trim()) {
    await fetch(`/api/posts/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
    input.value = "";
    loadImages();
  }
}

function toggleComments(id) {
  const box = document.getElementById(`comments-${id}`);
  box.style.display = box.style.display === "none" ? "block" : "none";
}

loadImages();
