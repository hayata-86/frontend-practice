console.log("app.js loaded");

window.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.querySelector(".search__form");
  const searchInput = document.querySelector(".search__input");
  const productList = document.querySelector("#productList");

  const addForm = document.querySelector(".add-form");
  const addInput = document.querySelector(".add-input");
  const addButton = document.querySelector(".add-button");

  const products = ["ノートPC", "キーボード", "マウス", "モニター", "USBケーブル"];

  function render(list) {
    productList.innerHTML = "";

    if (list.length === 0) {
      productList.innerHTML = '<li class="product__item">該当なし</li>';
      return;
    }

    for (const name of list) {
      const li = document.createElement("li");
      li.className = "product__item";

      const span = document.createElement("span");
      span.textContent = name;

      const deleteButton = document.createElement("button");
      deleteButton.className = "delete-button";
      deleteButton.textContent = "削除";

      deleteButton.addEventListener("click", function () {
        const index = products.indexOf(name);

        if (index !== -1) {
          products.splice(index, 1);
        }

        render(products);
      });

      li.appendChild(span);
      li.appendChild(deleteButton);
      productList.appendChild(li);
    }
  }

  render(products);

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const keyword = searchInput.value.trim();
    const filtered = products.filter(function (product) {
      return product.includes(keyword);
    });

    render(filtered);
  });

  addForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  addButton.addEventListener("click", function (event) {
    event.preventDefault();

    const newProduct = addInput.value.trim();

    if (newProduct === "") {
      return;
    }

    products.push(newProduct);
    render(products);
    addInput.value = "";
  });
});