const paginate = document.querySelector("#paginate");
const campgroundsTemplate = document.querySelector("#campgrounds-container");

paginate.addEventListener("mouseover", function () {
  let pos = this.href.search("page=");
  let link = this.href.slice(pos);
  if (link === "page=null" || link === "page=") {
    paginate.textContent = "No more Camps";
    paginate.classList.add("disabled");
    return;
  }
});

paginate.addEventListener("click", function (e) {
  e.preventDefault();
  fetch(this.href)
    .then((response) => response.json())
    .then((data) => {
      for (let campground of data.docs) {
        let template = generateCampground(campground);
        const div = document.createElement("div");
        div.innerHTML = template;
        campgroundsTemplate.append(div);
      }
      let { nextPage } = data;
      this.href = this.href.replace(/page=\d+/, `page=${nextPage}`); //* or use slicing as in mouseover event
    })
    .catch((e) => console.log("error !", e));
});

const generateCampground = function (campground) {
  htmlTemplate = `<div class="card mb-2">
      <div class="row">
        <div class="col-md-4">
            <img src="${
              campground.images.length
                ? campground.images[0].url
                : "https://images.unsplash.com/photo-1471115853179-bb1d604434e0?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=764&q=80"
            }" class="img-fluid card-image" />
        </div>
        <div class="col-md-8 py-3">
          <h5 class="card-title">
            ${campground.title}
          </h5>
          <p class="card-text">
            ${campground.description}
          </p>
          <p>---<small class="text-muted">
              ${campground.location}
            </small></p>
          <a href="/campgrounds/${campground._id}" class="btn btn-primary">View Camp</a>
        </div>
      </div>
    </div> `;
  return htmlTemplate;
};
