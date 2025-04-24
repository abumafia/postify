const audioDiv = document.getElementById("audios");

async function loadAudios() {
  const res = await fetch("/api/posts");
  const posts = await res.json();
  const audioPosts = posts.filter(
    p => Array.isArray(p.media) && p.media.some(m => m.type && m.type.startsWith("audio"))
  );

  audioDiv.innerHTML = "";

  audioPosts.forEach(post => {
    const audios = post.media.filter(m => m.type.startsWith("audio"));
    const div = document.createElement("div");
    div.className = "audio-post";
    div.innerHTML = `
      <div class="audio-info">
        <strong>📤 ${post.name}</strong> — <small>${new Date(post.createdAt).toLocaleString()}</small>
        <p>${post.text}</p>
      </div>

      ${audios.map(audio => `
        <div class="audio-block">
          <audio controls class="custom-audio">
            <source src="http://localhost:3000/${audio.filename}" type="${audio.type}" />
          </audio>
          <a href="http://localhost:3000/${audio.filename}" download class="download-btn">⬇️ Yuklab olish</a>
        </div>
      `).join("")}

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
    audioDiv.appendChild(div);
  });
}

async function likePost(id) {
  await fetch(`/api/posts/${id}/like`, { method: "POST" });
  loadAudios();
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
    loadAudios();
  }
}

function toggleComments(id) {
  const box = document.getElementById(`comments-${id}`);
  box.style.display = box.style.display === "none" ? "block" : "none";
}

loadAudios();
