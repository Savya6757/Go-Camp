(function () {
  "use-strict";
  const forms = document.querySelectorAll(".validate");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (e) => {
        if (!form.checkValidity()) {
          e.preventDefault();
          e.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();
