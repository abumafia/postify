const textDiv = document.getElementById("text-posts");

async function loadTexts() {
  const res = await fetch("/api/posts");
  const posts = await res.json();
  const textPosts = posts.filter(p =>
    (!p.media || p.media.length === 0) && p.text && p.text.trim().length > 0
  );

  textDiv.innerHTML = "";

  textPosts.forEach(post => {
    const div = document.createElement("div");
    div.className = "audio-post"; // bir xil stil ishlatsak bo'ladi

    div.innerHTML = `
      <div class="audio-info">
        <strong>📤 ${post.name}</strong> — <small>${new Date(post.createdAt).toLocaleString()}</small>
        <p style="font-size: 16px; line-height: 1.6;">${post.text}</p>
      </div>

      <div class="interaction">
        <button class="like-btn" onclick="likePost(${post.id})">❤️ ${post.likes}</button>
        <button class="toggle-comments" onclick="toggleComments(${post.id})">💬 Kommentlar (${post.comments.length})</button>

        <div class="comment-box" id="comments-${post.id}" style="display:none;">
          <input type="text" id="comment-${post.id}" placeholder="Komment yozing..." />
          <button onclick="commentPost(${post.id})">Yuborish</button>
          ${post.comments.map(c => `<div class="comment">${c}</div>`).join("")}
        </div>
      </div>
    `;
    textDiv.appendChild(div);
  });
}

async function likePost(id) {
  await fetch(`/api/posts/${id}/like`, { method: "POST" });
  loadTexts();
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
    loadTexts();
  }
}

function toggleComments(id) {
  const box = document.getElementById(`comments-${id}`);
  box.style.display = box.style.display === "none" ? "block" : "none";
}

loadTexts();
