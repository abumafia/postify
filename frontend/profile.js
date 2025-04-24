const profile = new URLSearchParams(location.search).get("user");
document.getElementById("profile-name").textContent = `👤 ${profile} profili`;

async function loadProfile() {
  const res = await fetch("/api/posts");
  const posts = await res.json();
  const userPosts = posts.filter(p => p.name.toLowerCase() === profile?.toLowerCase());

  // Profil maʼlumotlarini localStorage’dan olish
  const localProfile = JSON.parse(localStorage.getItem("profile") || "{}");
  if (localProfile.name?.toLowerCase() === profile.toLowerCase()) {
    if (localProfile.bio) {
      document.getElementById("profile-bio").textContent = localProfile.bio;
    }
    if (localProfile.image) {
      const img = document.getElementById("profile-img");
      img.src = localProfile.image;
      img.style.display = "block";
      img.style.width = "80px";
      img.style.height = "80px";
      img.style.borderRadius = "50%";
      img.style.marginRight = "15px";
    }
  }

  // Obuna statistikasi
  const currentUser = localProfile.name;
  const followData = JSON.parse(localStorage.getItem("follows") || "{}");
  const followers = Object.entries(followData)
    .filter(([user, list]) => list.includes(profile))
    .map(([user]) => user);
  const following = followData[profile] || [];

  const profileStats = document.createElement("div");
  profileStats.style.marginTop = "10px";
  profileStats.innerHTML = `
    <p>👥 <b>${followers.length}</b> ta obunachi | <b>${following.length}</b> ta obuna</p>
  `;

  if (currentUser && currentUser !== profile) {
    const isFollowing = (followData[currentUser] || []).includes(profile);
    const followBtn = document.createElement("button");
    followBtn.className = "follow-btn";
    followBtn.textContent = isFollowing ? "🚫 Obunani bekor qilish" : "➕ Obuna bo'lish";
    followBtn.onclick = () => toggleFollow(profile);
    profileStats.appendChild(followBtn);
    const chatBtn = document.createElement("a");
chatBtn.textContent = "💬 Chat";
chatBtn.href = `chat.html?with=${profile}`;
chatBtn.className = "follow-btn";
chatBtn.style.marginLeft = "10px";
profileStats.appendChild(chatBtn);
  }

  document.querySelector(".profile-header").appendChild(profileStats);

  // Postlar
  const postDiv = document.getElementById("user-posts");
  if (userPosts.length === 0) {
    postDiv.innerHTML = "<p>🚫 Bu foydalanuvchi hali post joylamagan.</p>";
    return;
  }

  postDiv.innerHTML = "";
  userPosts.forEach(post => {
    const div = document.createElement("div");
    div.className = "audio-post";
    div.innerHTML = `
      <div class="audio-info">
        <strong>${post.name}</strong> — <small>${new Date(post.createdAt).toLocaleString()}</small>
        <p>${post.text}</p>
      </div>
      ${post.media.map(m => renderMedia(m.filename, m.type)).join("")}
      <div class="interaction">
        <button class="like-btn" onclick="likePost(${post.id})">❤️ ${post.likes}</button>
        <button class="toggle-comments" onclick="toggleComments(${post.id})">💬 Kommentlar (${post.comments.length})</button>
        <div class="comment-box" id="comments-${post.id}" style="display: none;">
          <input type="text" id="comment-${post.id}" placeholder="Komment yozing..." />
          <button onclick="commentPost(${post.id})">Yuborish</button>
          ${post.comments.map(c => `<div class="comment">${c}</div>`).join("")}
        </div>
      </div>
    `;
    postDiv.appendChild(div);
  });
}

function renderMedia(file, type) {
  const url = `http://localhost:3000/${file}`;
  if (type.startsWith("image")) return `<img src="${url}" class="post-media" />`;
  if (type.startsWith("video")) return `<video src="${url}" class="post-media" controls></video>`;
  if (type.startsWith("audio")) return `<audio src="${url}" class="post-media" controls></audio>`;
  return "";
}

async function likePost(id) {
  await fetch(`/api/posts/${id}/like`, { method: "POST" });
  loadProfile();
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
    loadProfile();
  }
}

function toggleComments(id) {
  const box = document.getElementById(`comments-${id}`);
  box.style.display = box.style.display === "none" ? "block" : "none";
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
  location.reload();
}

loadProfile();
