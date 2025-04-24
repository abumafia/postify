const urlParams = new URLSearchParams(window.location.search);
const user1 = JSON.parse(localStorage.getItem("profile") || "{}")?.name;
const user2 = urlParams.get("with");

if (!user1 || !user2) location.href = "index.html";

document.getElementById("chatWith").textContent = `Siz ${user2} bilan suhbatlashmoqdasiz`;

const chatKey = `chat-${[user1, user2].sort().join("-")}`;
let messages = JSON.parse(localStorage.getItem(chatKey) || "[]");

function renderChat() {
  const chatBox = document.getElementById("chatBox");
  chatBox.innerHTML = messages.map(msg => `
    <div class="${msg.from === user1 ? "me" : "them"}">${msg.from}: ${msg.text}</div>
  `).join("");
  chatBox.scrollTop = chatBox.scrollHeight;
}

function sendMessage() {
  const input = document.getElementById("chatMessage");
  const text = input.value.trim();
  if (!text) return;
  messages.push({ from: user1, text });
  localStorage.setItem(chatKey, JSON.stringify(messages));
  input.value = "";
  renderChat();
}

function clearChat() {
  if (confirm("Chatni tozalashni istaysizmi?")) {
    localStorage.removeItem(chatKey);
    messages = [];
    renderChat();
  }
}

setInterval(() => {
  messages = JSON.parse(localStorage.getItem(chatKey) || "[]");
  renderChat();
}, 1000);

renderChat();
