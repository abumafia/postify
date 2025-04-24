const form = document.getElementById("postForm");
const postsDiv = document.getElementById("posts");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    if (!profile.name) {
      alert("Avval profilni to‘ldiring!");
      openProfileModal();
      return;
    }
  
    const formData = new FormData();
    formData.append("name", profile.name);
    formData.append("text", document.getElementById("text").value);
  
    const files = document.getElementById("media").files;
    for (let i = 0; i < files.length; i++) {
      formData.append("media", files[i]);
    }
  
    await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      body: formData,
    });
  
    form.reset();
    document.getElementById("file-name").textContent = "Hech qanday fayl tanlanmagan";
    loadPosts();
  });  

// Fayl nomini chiqarish
document.getElementById("media").addEventListener("change", function () {
  const fileName = this.files.length > 0 ? this.files.length + " ta fayl tanlandi" : "Hech qanday fayl tanlanmagan";
  document.getElementById("file-name").textContent = fileName;
});

async function loadPosts(scrollBack = false) {
  const scrollPos = window.scrollY;

  postsDiv.innerHTML = "";
  const res = await fetch("http://localhost:3000/api/posts");
  const posts = await res.json();
  posts.forEach(post => {
    const div = document.createElement("div");
    div.className = "post";
    div.innerHTML = `
      <b><a href="profile.html?user=${post.name}" class="profile-link">${post.name}</a></b> <small>${new Date(post.createdAt).toLocaleString()}</small>
      <p>${post.text}</p>
      <div class="carousel">
        ${post.media.map(m => renderMedia(m.filename, m.type)).join("")}
      </div>
      <button type="button" class="like-btn" onclick="likePost(${post.id})">❤️ ${post.likes}</button>
      <button type="button" class="toggle-comments" onclick="toggleComments(${post.id})">Kommentlarni ko‘rsatish</button>
      <div class="comment-box" id="comments-${post.id}" style="display: none;">
        <input type="text" id="comment-${post.id}" placeholder="Komment yozing"/>
        <button type="button" onclick="commentPost(${post.id})">Yuborish</button>
        ${post.comments.map(c => `<div class="comment">${c}</div>`).join("")}
      </div>
    `;
    postsDiv.appendChild(div);
  });

  if (scrollBack) {
    window.scrollTo({ top: scrollPos, behavior: "instant" });
  }
}

function renderMedia(file, type) {
  const url = `http://localhost:3000/${file}`;
  if (type.startsWith("image")) return `<img src="${url}" class="post-media" />`;
  if (type.startsWith("video")) return `<video src="${url}" class="post-media" controls></video>`;
  if (type.startsWith("audio")) return `<audio src="${url}" class="post-media" controls></audio>`;
  return "";
}

async function likePost(id) {
    const currentUser = JSON.parse(localStorage.getItem("profile") || "{}")?.name;
  
    await fetch(`/api/posts/${id}/like`, { method: "POST" });
  
    // local allPosts bo‘sh bo‘lsa postni qayta chaqiramiz
    let post = allPosts.find(p => p.id === id);
    if (!post) {
      const res = await fetch("/api/posts");
      const posts = await res.json();
      post = posts.find(p => p.id === id);
    }
  
    if (post && post.name !== currentUser) {
      notifyUser(post.name, `${currentUser} sizning postingizni yoqtirdi`);
    }
  
    loadPosts(true);
  }  

  async function commentPost(id) {
    const input = document.getElementById(`comment-${id}`);
    const comment = input.value.trim();
    const currentUser = JSON.parse(localStorage.getItem("profile") || "{}")?.name;
  
    if (!comment) return;
  
    await fetch(`/api/posts/${id}/comment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment }),
    });
  
    // postni topamiz
    let post = allPosts.find(p => p.id === id);
    if (!post) {
      const res = await fetch("/api/posts");
      const posts = await res.json();
      post = posts.find(p => p.id === id);
    }
  
    if (post && post.name !== currentUser) {
      notifyUser(post.name, `${currentUser} sizning postingizga komment yozdi`);
    }
  
    input.value = "";
    loadPosts(true);
  }  

function toggleComments(id) {
  const box = document.getElementById(`comments-${id}`);
  const button = box.previousElementSibling;
  if (box.style.display === "none") {
    box.style.display = "block";
    button.textContent = "Kommentlarni yashirish";
  } else {
    box.style.display = "none";
    button.textContent = "Kommentlarni ko‘rsatish";
  }
}

const searchInput = document.getElementById("search");
let allPosts = [];

searchInput?.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();
  const filtered = allPosts.filter(p =>
    p.text.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
  );
  renderPosts(filtered);
});

function renderPosts(posts) {
    postsDiv.innerHTML = "";
    const currentUser = JSON.parse(localStorage.getItem("profile") || "{}")?.name;
    const followData = JSON.parse(localStorage.getItem("follows") || "{}");
  
    posts.forEach(post => {
      const isFollowing = (followData[currentUser] || []).includes(post.name);
      const followBtn = (post.name !== currentUser) ? `
        <button class="follow-btn" onclick="toggleFollow('${post.name}')">
          ${isFollowing ? "🚫 Obunani bekor qilish" : "➕ Obuna bo'lish"}
        </button>
      ` : "";
  
      const div = document.createElement("div");
      div.className = "post";
      div.innerHTML = `
        <b><a href="profile.html?user=${post.name}" class="profile-link">${post.name}</a></b> 
        <small>${new Date(post.createdAt).toLocaleString()}</small>
        ${followBtn}
        <p>${post.text}</p>
        <div class="carousel">
          ${post.media.map(m => renderMedia(m.filename, m.type)).join("")}
        </div>
        <button class="like-btn" onclick="likePost(${post.id})">❤️ ${post.likes}</button>
        <button class="toggle-comments" onclick="toggleComments(${post.id})">💬 Kommentlar</button>
        <div class="comment-box" id="comments-${post.id}" style="display: none;">
          <input type="text" id="comment-${post.id}" placeholder="Komment yozing"/>
          <button onclick="commentPost(${post.id})">Yuborish</button>
          ${post.comments.map(c => `<div class="comment">${c}</div>`).join("")}
        </div>
      `;
      postsDiv.appendChild(div);
    });
  }  

async function loadPosts(scrollBack = false) {
    const scrollPos = window.scrollY;
    const res = await fetch("http://localhost:3000/api/posts");
    allPosts = await res.json();
    renderPosts(allPosts);
    if (scrollBack) window.scrollTo({ top: scrollPos, behavior: "instant" });
  }  

  function openProfileModal() {
    document.getElementById("profileModal").style.display = "flex";
  }
  
  function closeProfileModal() {
    document.getElementById("profileModal").style.display = "none";
  }
  
  function saveProfile() {
    const name = document.getElementById("profileName").value.trim();
    const bio = document.getElementById("profileBio").value.trim();
    const file = document.getElementById("profileImage").files[0];
  
    if (!name) return alert("Ism majburiy!");
  
    const reader = new FileReader();
    reader.onload = function (e) {
      const imageData = file ? e.target.result : null;
      const profile = { name, bio, image: imageData };
      localStorage.setItem("profile", JSON.stringify(profile));
      closeProfileModal();
    };
  
    if (file) reader.readAsDataURL(file);
    else {
      const profile = { name, bio };
      localStorage.setItem("profile", JSON.stringify(profile));
      closeProfileModal();
    }
  }

  function openPostModal() {
    document.getElementById("postModal").classList.remove("hidden");
  }
  
  function closePostModal() {
    document.getElementById("postModal").classList.add("hidden");
  }  

  function toggleFollow(user) {
    const currentUser = JSON.parse(localStorage.getItem("profile") || "{}")?.name;
    if (!currentUser) return alert("Avval profilni to‘ldiring!");
  
    let followData = JSON.parse(localStorage.getItem("follows") || "{}");
    if (!followData[currentUser]) followData[currentUser] = [];
  
    if (followData[currentUser].includes(user)) {
      followData[currentUser] = followData[currentUser].filter(u => u !== user);
    } else {
      followData[currentUser].push(user);
    }
  
    localStorage.setItem("follows", JSON.stringify(followData));
    loadPosts(true); // sahifani yangilab, pozitsiyani saqlash
  }  

  function notifyUser(user, message) {
    const currentUser = JSON.parse(localStorage.getItem("profile") || "{}")?.name;
    if (user === currentUser) return; // o‘ziga bildirishnoma yozilmaydi
  
    let notifications = JSON.parse(localStorage.getItem("notifications") || "{}");
    if (!notifications[user]) notifications[user] = [];
    notifications[user].push(message);
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }  

  function hasNewNotification() {
    const currentUser = JSON.parse(localStorage.getItem("profile") || "{}")?.name;
    const notifs = JSON.parse(localStorage.getItem("notifications") || "{}")[currentUser] || [];
    return notifs.length > 0;
  }  

  // script.js oxiriga qo‘shing
window.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("notifBtn");
    if (btn && hasNewNotification()) {
      btn.innerHTML = "🔔<span style='color:red;'>●</span>";
    }
  });  

  // Sahifa yuklanganda postlarni chiqarish
loadPosts();
