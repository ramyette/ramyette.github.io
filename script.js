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
  const linkPath = new URL(a.href).pathname;
  const currentPath = window.location.pathname;
  if (
    currentPath === linkPath ||
    (linkPath !== "/" && currentPath.startsWith(linkPath))
  ) {
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

// format date helper (for blog posts)
function formatLocalDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

// build the preview text for blog post previews
function buildPreviewText(article, maxLength = 120) {
  let text = "";

  const paragraphs = article.querySelectorAll("p");

  for (const p of paragraphs) {
    const chunk = p.textContent.trim();

    if (!chunk) continue;

    if (text.length + chunk.length <= maxLength) {
      text += (text ? " " : "") + chunk;
    } else {
      const remaining = maxLength - text.length;
      text += (text ? " " : "") + chunk.slice(0, remaining);
      break;
    }
  }

  return text.length < maxLength ? text : text + "...";
}

// blog sort
const sort = document.getElementById("blogSort");

sort?.addEventListener("change", e => {
  const cards = [...document.querySelectorAll(".blog-card")];
  const newest = e.target.value === "newest";

  cards.sort((a, b) =>
    newest
      ? new Date(b.dataset.date) - new Date(a.dataset.date)
      : new Date(a.dataset.date) - new Date(b.dataset.date)
  );

  cards.forEach(c => c.parentNode.appendChild(c));
});

// blog modal
async function loadBlogCards() {
  const cards = document.querySelectorAll(".blog-card");

  for (const card of cards) {
    const post = card.dataset.post;

    const res = await fetch(`/blog/posts/${post}.html`);
    const html = await res.text();

    const temp = document.createElement("div");
    temp.innerHTML = html;

    const article = temp.querySelector("article");
    if (!article) continue;

    const title = article.dataset.title;
    const date = article.dataset.date;
    const preview = buildPreviewText(article, 120);

    card.dataset.date = date;

    card.innerHTML = `
      <h2>${title}</h2>
      <p class="blog-date">${formatLocalDate(date)}</p>
      <p>${preview}</p>
    `;
  }
}

loadBlogCards();

const modal = document.getElementById("blogModal");
const content = document.getElementById("blogContent");

document.querySelectorAll(".blog-card").forEach(card => {
  card.addEventListener("click", async () => {
    const post = card.dataset.post;

    const res = await fetch(`/blog/posts/${post}.html`);
    const html = await res.text();

    const temp = document.createElement("div");
    temp.innerHTML = html;

    const article = temp.querySelector("article");
    if (!article) return;

    const title = article.dataset.title;
    const date = article.dataset.date;

    document.getElementById("blogModalTitle").textContent = title;
    document.getElementById("blogModalDate").textContent =
      formatLocalDate(date);

    document.getElementById("blogContent").innerHTML =
      article.innerHTML;

    document.getElementById("blogModal").classList.add("visible");
  });
});

function closeBlog() {
  modal.classList.remove("visible");
}

// project search
const search = document.getElementById("projectSearch");

search?.addEventListener("input", e => {
  const query = e.target.value.trim().toLowerCase();

  document.querySelectorAll(".project-card").forEach(card => {
    const titleText = card.querySelector("h2")?.textContent.toLowerCase() || "";
    const tagString = card.dataset.tags || "";
    const tags = tagString.toLowerCase().split(/\s+/);

    let matches = false;

    if (!query) {
      matches = true;
    }

    else if (tags.includes(query)) {
      matches = true;
    }
    
    else if (query.length > 1) {
      matches =
        titleText.includes(query) ||
        tagString.toLowerCase().includes(query);
    }

    card.style.display = matches ? "" : "none";
  });
});

modal.addEventListener("click", e => {
  if (e.target === modal) {
    closeBlog();
  }
});

// Theme switching
const themeSelect = document.getElementById("themeSelect");

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "light";
applyTheme(savedTheme);

if (themeSelect) {
  themeSelect.value = savedTheme;

  themeSelect.addEventListener("change", e => {
    applyTheme(e.target.value);
  });
}
