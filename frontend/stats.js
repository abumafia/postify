async function loadStats() {
    const res = await fetch("/api/posts");
    const posts = await res.json();
  
    // Top users
    const userCount = {};
    posts.forEach(p => {
      userCount[p.name] = (userCount[p.name] || 0) + 1;
    });
  
    const topUsers = Object.entries(userCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  
    const sortedByLikes = [...posts]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 5);
  
    const sortedByComments = [...posts]
      .sort((a, b) => b.comments.length - a.comments.length)
      .slice(0, 5);
  
    // Chart.js: Top Users Bar Chart
    new Chart(document.getElementById("userChart"), {
      type: "bar",
      data: {
        labels: topUsers.map(u => u[0]),
        datasets: [{
          label: "Postlar soni",
          data: topUsers.map(u => u[1]),
          backgroundColor: "#3b82f6",
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });
  
    // Chart.js: Top Likes
    new Chart(document.getElementById("likeChart"), {
      type: "bar",
      data: {
        labels: sortedByLikes.map(p => p.text?.slice(0, 20) || "📷 Media"),
        datasets: [{
          label: "Layklar soni",
          data: sortedByLikes.map(p => p.likes),
          backgroundColor: "#f59e0b",
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });
  
    // Chart.js: Top Comments
    new Chart(document.getElementById("commentChart"), {
      type: "bar",
      data: {
        labels: sortedByComments.map(p => p.text?.slice(0, 20) || "🎬 Media"),
        datasets: [{
          label: "Kommentlar soni",
          data: sortedByComments.map(p => p.comments.length),
          backgroundColor: "#10b981",
        }],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });

    // Oxirgi 7 kunlik
const dailyMap = {};
for (let i = 6; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i);
  const key = d.toLocaleDateString();
  dailyMap[key] = 0;
}
posts.forEach(p => {
  const d = new Date(p.createdAt).toLocaleDateString();
  if (dailyMap[d] !== undefined) dailyMap[d]++;
});
new Chart(document.getElementById("dailyChart"), {
  type: "line",
  data: {
    labels: Object.keys(dailyMap),
    datasets: [{
      label: "Postlar soni (kunlik)",
      data: Object.values(dailyMap),
      borderColor: "#6366f1",
      backgroundColor: "rgba(99,102,241,0.2)",
      tension: 0.3,
      fill: true
    }],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
  },
});

// Oxirgi 4 haftalik
const weeklyMap = {};
for (let i = 3; i >= 0; i--) {
  const d = new Date();
  d.setDate(d.getDate() - i * 7);
  const year = d.getFullYear();
  const week = getWeekNumber(d);
  weeklyMap[`Hafta ${week}`] = 0;
}
posts.forEach(p => {
  const date = new Date(p.createdAt);
  const week = getWeekNumber(date);
  const key = `Hafta ${week}`;
  if (weeklyMap[key] !== undefined) weeklyMap[key]++;
});
new Chart(document.getElementById("weeklyChart"), {
  type: "line",
  data: {
    labels: Object.keys(weeklyMap),
    datasets: [{
      label: "Postlar soni (haftalik)",
      data: Object.values(weeklyMap),
      borderColor: "#f97316",
      backgroundColor: "rgba(249,115,22,0.2)",
      tension: 0.3,
      fill: true
    }],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
  },
});

// Oxirgi 6 oylik
const monthlyMap = {};
for (let i = 5; i >= 0; i--) {
  const d = new Date();
  d.setMonth(d.getMonth() - i);
  const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
  monthlyMap[key] = 0;
}
posts.forEach(p => {
  const d = new Date(p.createdAt);
  const key = `${d.toLocaleString("default", { month: "short" })} ${d.getFullYear()}`;
  if (monthlyMap[key] !== undefined) monthlyMap[key]++;
});
new Chart(document.getElementById("monthlyChart"), {
  type: "line",
  data: {
    labels: Object.keys(monthlyMap),
    datasets: [{
      label: "Postlar soni (oylik)",
      data: Object.values(monthlyMap),
      borderColor: "#10b981",
      backgroundColor: "rgba(16,185,129,0.2)",
      tension: 0.3,
      fill: true
    }],
  },
  options: {
    responsive: true,
    plugins: { legend: { display: false } },
  },
});

// Funksiya: hafta raqamini olish (ISO)
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return weekNo;
}

// 👤 Eng faol foydalanuvchilar (profil bilan)
const topUsersHtml = topUsers.map(([name, count]) => {
    const profile = JSON.parse(localStorage.getItem("profile") || "{}");
    const isSelf = profile.name?.toLowerCase() === name.toLowerCase();
    const avatar = isSelf && profile.image ? `<img src="${profile.image}" class="mini-avatar" />` : '';
    const bio = isSelf && profile.bio ? `<small style="display:block;margin-bottom:4px;">${profile.bio}</small>` : '';
    return `
      <div class="user-card">
        ${avatar}
        <div>
          <a href="profile.html?user=${name}" class="profile-link">${name}</a>
          ${bio}
          <small>📌 ${count} ta post</small>
        </div>
      </div>
    `;
  }).join("");
  
  document.getElementById("top-users-display").innerHTML = `
    <h2>👑 Eng faol foydalanuvchilar (profil bilan)</h2>
    ${topUsersHtml}
  `;
  
  // 🔥 Eng ko‘p layk olgan postlar (to‘liq)
  const topLikedHtml = sortedByLikes.map(p => {
    return `
      <div class="post-card">
        <div>
          <b><a href="profile.html?user=${p.name}" class="profile-link">${p.name}</a></b> —
          ❤️ ${p.likes} &nbsp; 🕒 ${new Date(p.createdAt).toLocaleString()}
          <p>${p.text}</p>
          ${p.media?.length > 0 ? renderMedia(p.media[0].filename, p.media[0].type) : ''}
        </div>
      </div>
    `;
  }).join("");
  
  document.getElementById("top-liked-display").innerHTML = `
    <h2>🔥 Eng ko‘p layk olgan postlar (to‘liq)</h2>
    ${topLikedHtml}
  `;
  
  // 💬 Eng ko‘p komentli postlar
  const topCommentedHtml = sortedByComments.map(p => {
    return `
      <div class="post-card">
        <div>
          <b><a href="profile.html?user=${p.name}" class="profile-link">${p.name}</a></b> —
          💬 ${p.comments.length} &nbsp; 🕒 ${new Date(p.createdAt).toLocaleString()}
          <p>${p.text}</p>
          ${p.media?.length > 0 ? renderMedia(p.media[0].filename, p.media[0].type) : ''}
        </div>
      </div>
    `;
  }).join("");
  
  document.getElementById("top-commented-display").innerHTML = `
    <h2>💬 Eng ko‘p koment olgan postlar (to‘liq)</h2>
    ${topCommentedHtml}
  `;
  
  // Media render funksiyasi
  function renderMedia(file, type) {
    const url = `http://localhost:3000/${file}`;
    if (type.startsWith("image")) return `<img src="${url}" class="post-media" style="max-width:100%;border-radius:8px;" />`;
    if (type.startsWith("video")) return `<video src="${url}" controls style="max-width:100%;border-radius:8px;"></video>`;
    if (type.startsWith("audio")) return `<audio src="${url}" controls style="width:100%;"></audio>`;
    return "";
  }  

  function showPostModal(postId) {
    const post = allPosts.find(p => p.id === postId);
    if (!post) return;
  
    const content = `
      <h2>${post.text}</h2>
      ${post.media ? `<video src="${post.media}" controls style="max-width: 100%; border-radius: 8px;"></video>` : ''}
      <p><strong>Likes:</strong> ${post.likes.length}</p>
      <p><strong>Comments:</strong> ${post.comments.length}</p>
    `;
    document.getElementById('postDetails').innerHTML = content;
    document.getElementById('postModal').classList.remove('hidden');
  }
  
  function closePostModal() {
    document.getElementById('postModal').classList.add('hidden');
  }  
  
    // Bugungi postlar
    const today = new Date().toDateString();
    const todayPosts = posts.filter(p => new Date(p.createdAt).toDateString() === today);
  
    document.getElementById("today-stats").innerHTML = `
      <h2>📅 Bugun joylangan postlar</h2>
      <p>📌 ${todayPosts.length} ta post</p>
    `;
  }
  
  loadStats();
  