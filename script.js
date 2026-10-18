// =========================================================
// DrainGuard – public website behaviour
// =========================================================

// 1) QR entry: remember which bin was scanned (e.g. index.html?bin=BIN001)
try {
  const bin = new URLSearchParams(location.search).get("bin");
  if (bin) localStorage.setItem("dg_bin", bin);
} catch (e) { /* storage may be blocked - ignore */ }

// 2) Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// 3) Mobile menu
const burger = document.getElementById("burger");
const links = document.getElementById("links");
function setMenu(open) {
  links.classList.toggle("open", open);
  burger.setAttribute("aria-expanded", open ? "true" : "false");
  burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
burger.addEventListener("click", () => setMenu(!links.classList.contains("open")));
links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });

// 4) Problem carousel
(function () {
  const carousel = document.getElementById("carousel");
  const track = document.getElementById("track");
  const slides = Array.from(track.children);
  const dotsBox = document.getElementById("dots");
  const count = document.getElementById("count");
  let index = 0;

  const dots = slides.map((_, n) => {
    const d = document.createElement("button");
    d.className = "dot";
    d.type = "button";
    d.setAttribute("aria-label", "Go to slide " + (n + 1));
    d.addEventListener("click", () => go(n));
    dotsBox.appendChild(d);
    return d;
  });

  function go(n) {
    index = (n + slides.length) % slides.length;
    track.style.transform = "translateX(-" + index * 100 + "%)";
    dots.forEach((d, k) => {
      d.classList.toggle("on", k === index);
      d.setAttribute("aria-current", k === index ? "true" : "false");
    });
    slides.forEach((s, k) => s.setAttribute("aria-hidden", k === index ? "false" : "true"));
    count.textContent = (index + 1) + " / " + slides.length;
  }

  document.getElementById("prev").addEventListener("click", () => go(index - 1));
  document.getElementById("next").addEventListener("click", () => go(index + 1));

  // Keyboard arrows when the carousel is focused
  carousel.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") go(index - 1);
    if (e.key === "ArrowRight") go(index + 1);
  });

  // Swipe on phones
  let startX = null;
  track.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener("touchend", e => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    startX = null;
  });

  go(0);
})();

// 5) Fade-in on scroll
(function () {
  const items = document.querySelectorAll(".reveal");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) {
    items.forEach(el => el.classList.add("show"));
    return;
  }
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("show");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach(el => io.observe(el));
})();