const fileSize = function (imgFiles) {
  let totalSize = 0;
  for (file of imgFiles) {
    totalSize += file.size;
  }
  return totalSize;
};

const checkFile = () => {
  const imgFiles = document.querySelector("input[type='file']");
  const btn = document.querySelector(".submit");
  const availableSize = 5000000;
  if (imgFiles && btn) {
    imgFiles.addEventListener("change", function (e) {
      console.dir(imgFiles);
      let totalSize = fileSize(imgFiles.files);

      if (imgFiles.files.length > 5 || totalSize > availableSize) {
        imgFiles.classList.add("is-invalid");
        imgFiles.classList.remove("is-valid");
        btn.disabled = true;
      } else {
        imgFiles.classList.remove("is-invalid");
        imgFiles.classList.add("is-valid");
        btn.disabled = false;
      }
    });
  }
};

(function () {
  "use strict";
  const forms = document.querySelectorAll(".validate");
  Array.prototype.slice.call(forms).forEach(function (form) {
    checkFile();
    form.addEventListener(
      "submit",
      function (event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });
})();
