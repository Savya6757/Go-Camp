const btn = document.querySelector(".up-btn");

document.addEventListener(
  "scroll",
  function (e) {
    if (window.scrollY > btn.clientHeight) {
      btn.classList.add("scrolled");
    } else {
      btn.classList.remove("scrolled");
    }
  },
  { passive: true }
);

