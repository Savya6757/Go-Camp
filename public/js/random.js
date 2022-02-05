const btn = document.querySelector(".up-btn");

document.addEventListener("scroll", function () {
  if (window.scrollY > btn.clientHeight) {
    btn.classList.add("scrolled");
  } else {
    btn.classList.remove("scrolled");
  }
});
