// smooth page transition for internal links
document.querySelectorAll('a').forEach(link => {
  if (link.hostname === window.location.hostname) {
    link.addEventListener('click', e => {
      e.preventDefault();
      const href = link.getAttribute('href');
      document.body.style.opacity = 0;
      setTimeout(() => window.location = href, 400);
    });
  }
});

// random profile image logic
const images = [
  "me1.png", "me2.png", "me3.png", "me4.png",
  "me5.png", "me6.png", "me7.png"
];
const randomIndex = Math.floor(Math.random() * images.length);
const profileImage = document.getElementById("randomImage");
if (profileImage) {
  profileImage.src = "images/" + images[randomIndex];
}