const container = document.getElementById("admin-posts");
const searchInput = document.getElementById("search");

let allPosts = [];

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  const filtered = allPosts.filter(post =>
    post.text.toLowerCase().includes(query) || post.name.toLowerCase().includes(query)
  );
  renderAdminPosts(filtered);
});

async function loadAdminPosts() {
  const res = await fetch("/api/posts");
  allPosts = await res.json();
  allPosts.forEach(p => {
    p.likes = p.likes || 0;
    p.comments = Array.isArray(p.comments) ? p.comments : [];
  });
  renderAdminPosts(allPosts);
  loadAdminStats();
}

function renderAdminPosts(posts) {
  container.innerHTML = "";

  const banned = JSON.parse(localStorage.getItem("bannedUsers") || "[]");
  posts = posts.filter(p => !banned.includes(p.name));

  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <b>${post.name}</b> <small>${new Date(post.createdAt).toLocaleString()}</small>
      <p>${post.text}</p>
      <div class="carousel">
        ${post.media.map(m => renderMedia(m.filename, m.type)).join("")}
      </div>
      <p>❤️ ${post.likes} — 💬 ${post.comments.length}</p>
      <button onclick="deletePost(${post.id})" style="margin-top: 10px; background: #ef4444;">🗑 O‘chirish</button>
    `;
    container.appendChild(div);
  });
}

function renderMedia(file, type) {
  const url = `/${file}`;
  if (type.startsWith("image")) return `<img src="${url}" class="post-media" />`;
  if (type.startsWith("video")) return `<video src="${url}" class="post-media" controls></video>`;
  if (type.startsWith("audio")) return `<audio src="${url}" class="post-media" controls></audio>`;
  return "";
}

async function deletePost(id) {
  if (confirm("Ushbu postni o‘chirmoqchimisiz?")) {
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    loadAdminPosts();
  }
}

function loadAdminStats() {
  const userCount = {};

  allPosts.forEach(p => {
    userCount[p.name] = (userCount[p.name] || 0) + 1;
  });

  const topUsers = Object.entries(userCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const liked = [...allPosts].sort((a, b) => b.likes - a.likes).slice(0, 5);
  const commented = [...allPosts].sort((a, b) => b.comments.length - a.comments.length).slice(0, 5);

  document.getElementById("top-users").innerHTML = `
    <h3>👑 Eng faol foydalanuvchilar</h3>
    <ul>
      ${topUsers.map(([name, count]) => `<li><b>${name}</b> — ${count} ta post 
        <button onclick="filterByUser('${name}')">📂 Ko‘rish</button>
        <button onclick="banUser('${name}')">🚫 Ban</button>
      </li>`).join("")}
    </ul>
  `;

  document.getElementById("top-liked").innerHTML = `
    <h3>❤️ Eng ko‘p layk olingan postlar</h3>
    <ul>
      ${liked.map(p => `<li>${(p.text || '[media]').slice(0, 30)} — ❤️ ${p.likes}</li>`).join("")}
    </ul>
  `;

  document.getElementById("top-commented").innerHTML = `
    <h3>💬 Eng ko‘p komment olgan postlar</h3>
    <ul>
      ${commented.map(p => `<li>${(p.text || '[media]').slice(0, 30)} — 💬 ${p.comments.length}</li>`).join("")}
    </ul>
  `;
}

function filterByUser(name) {
  const userPosts = allPosts.filter(p => p.name === name);
  renderAdminPosts(userPosts);
}

function banUser(name) {
  let banned = JSON.parse(localStorage.getItem("bannedUsers") || "[]");
  if (!banned.includes(name)) {
    banned.push(name);
    localStorage.setItem("bannedUsers", JSON.stringify(banned));
    alert(`${name} ban qilindi.`);
    loadAdminPosts();
  }
}

loadAdminPosts();
