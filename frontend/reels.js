const reelsDiv = document.getElementById("reels");

async function loadReels() {
    const res = await fetch("/api/posts");
    const posts = await res.json();
    let videoPosts = posts.filter(
      p => Array.isArray(p.media) && p.media.some(m => m.type && m.type.startsWith("video"))
    );
  
    // 🔀 Shuffle qilish
    videoPosts = shuffleArray(videoPosts);
  
    reelsDiv.innerHTML = "";
  
    videoPosts.forEach(post => {
      const container = document.createElement("div");
      container.className = "reel-container";
  
      const video = document.createElement("video");
      video.className = "reel-video";
      video.src = `http://localhost:3000/${post.media.find(m => m.type.startsWith("video")).filename}`;
      video.controls = false;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
  
      const overlay = document.createElement("div");
      overlay.className = "reel-overlay";
      overlay.innerHTML = `
        <strong>${post.name}</strong><br>
        <small>${new Date(post.createdAt).toLocaleString()}</small><br>
        <p>${post.text}</p>
      `;
  
      const buttons = document.createElement("div");
      buttons.className = "reel-buttons";
      buttons.innerHTML = `
        <button class="reel-button" onclick="likePost(${post.id})">❤️<br><span>${post.likes}</span></button>
        <button class="reel-button" onclick="toggleComments(${post.id})">💬<br><span>${post.comments.length}</span></button>
      `;
  
      const commentBox = document.createElement("div");
      commentBox.className = "reel-comments";
      commentBox.id = `comments-${post.id}`;
      commentBox.style.display = "none";
      commentBox.innerHTML = `
        <input type="text" id="comment-${post.id}" placeholder="Komment yozing..." />
        <button onclick="commentPost(${post.id})">Yuborish</button>
        ${post.comments.map(c => `<div class="comment">${c}</div>`).join("")}
      `;
  
      container.appendChild(video);
      container.appendChild(overlay);
      container.appendChild(buttons);
      container.appendChild(commentBox);
      reelsDiv.appendChild(container);
    });
  }
  
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }  

async function likePost(id) {
  await fetch(`/api/posts/${id}/like`, { method: "POST" });
  loadReels();
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
    loadReels();
  }
}

function toggleComments(id) {
  const box = document.getElementById(`comments-${id}`);
  box.style.display = box.style.display === "none" ? "block" : "none";
}

loadReels();
