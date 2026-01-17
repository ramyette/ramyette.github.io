// page transitions
document.querySelectorAll('a').forEach(link => {
  if (link.hostname === window.location.hostname && !link.target) {
    link.addEventListener('click', e => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      e.preventDefault();
      document.body.style.opacity = 0;
      setTimeout(() => (window.location = href), 400);
    });
  }
});

// highlight active nav link
document.querySelectorAll(".nav-links a").forEach(a => {
  if (a.href === window.location.href) {
    a.classList.add("active");
  }
});

// random profile image logic
const imgEl = document.getElementById("randomImage");
const refreshBtn = document.getElementById("refreshImageBtn");

const images = ["me1.png", "me2.png", "me3.png", "me4.png", "me5.png", "me6.png", "me7.png"];
let lastImage = null;

function setRandomImage() {
  if (!imgEl) return;

  let newImg;
  do {
    newImg = images[Math.floor(Math.random() * images.length)];
  } while (newImg === lastImage);

  lastImage = newImg;
  imgEl.src = `/images/${newImg}`;
}

setRandomImage(); // initial load

refreshBtn?.addEventListener("click", setRandomImage);

// project unlocking logic (using AWS Lambda)
let currentProject = null;
const API_URL = "https://g11n14cja2.execute-api.us-east-1.amazonaws.com/unlock";

function openUnlockModal(project) {
  currentProject = project;
  document.getElementById("passwordInput").value = "";
  document.getElementById("modalError").textContent = "";
  document.getElementById("unlockModal").classList.add("visible");
}

function closeModal() {
  document.getElementById("unlockModal").classList.remove("visible");
}

async function submitPassword() {
  const key = document.getElementById("passwordInput").value;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  const data = await res.json();

  if (!res.ok || !data.projectsUnlocked.includes(currentProject)) {
    flashError("modalError", "Incorrect password");
    return;
  }

  unlockProjectUI(currentProject, data.files);
  closeModal();
}

function unlockProjectUI(name, files) {
  const card = document.querySelector(`.project-card[data-project="${name}"]`);
  const lock = card.querySelector(".lock-overlay");
  const buttons = card.querySelector(".download-buttons");

  lock.classList.add("fade-out");
  setTimeout(() => (lock.style.display = "none"), 400);

  buttons.innerHTML = files
    .map(f => `<a class="btn" href="${f.url}" download>${f.file.includes("source") ? "Download Source" : "Download Build"}</a>`)
    .join("");

  buttons.classList.add("fade-in");
}

async function unlockAll() {
  const key = document.getElementById("globalKey").value;

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key })
  });

  const data = await res.json();

  if (!res.ok) {
    flashError("globalError", "Incorrect key");
    return;
  }

  document.querySelectorAll(".project-card.locked").forEach(card => {
    let project = card.dataset.project;

    if (data.projectsUnlocked.includes(project)) {
      unlockProjectUI(project, data.files);
    }
  });
}

// enter key handling
document.addEventListener("keydown", e => {
  if (e.key === "Enter" && document.getElementById("unlockModal").classList.contains("visible")) {
    submitPassword();
  }
});

document.getElementById("globalKey")?.addEventListener("keydown", e => {
  if (e.key === "Enter") unlockAll();
});

// error text
function flashError(id, message, time = 5000) {
  const el = document.getElementById(id);
  el.textContent = message;

  if (el._timeout) clearTimeout(el._timeout);
  el._timeout = setTimeout(() => (el.textContent = ""), time);
}
