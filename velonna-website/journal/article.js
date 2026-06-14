// VELONNA — journal article pages.
// Static editorial pages; the only interactive piece is the footer newsletter,
// so this stays tiny (no GSAP/Lenis needed).
const form = document.getElementById("news-form");
const ok = document.getElementById("news-success");
form?.addEventListener("submit", (e) => {
  if (location.hostname === "localhost" || location.hostname === "127.0.0.1") e.preventDefault();
  if (ok) {
    ok.classList.add("is-shown");
    setTimeout(() => {
      ok.classList.remove("is-shown");
      form.reset();
    }, 3200);
  }
});
