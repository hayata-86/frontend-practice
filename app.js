console.log("app.js loaded");

window.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.querySelector(".search__form");
  const searchInput = document.querySelector(".search__input");
  const productList = document.querySelector("#productList");
  const resetButton = document.querySelector(".reset-button");
  const sortSelect = document.querySelector("#sortSelect");

  const addForm = document.querySelector(".add-form");
  const addInput = document.querySelector(".add-input");
  const addButton = document.querySelector(".add-button");
  const addMessage = document.querySelector(".add-message");

  const STORAGE_KEY = "products";

  let products = loadProducts();

  function loadProducts() {
    const savedProducts = localStorage.getItem(STORAGE_KEY);

    if (savedProducts) {
      return JSON.parse(savedProducts);
    }

    return ["ノートPC", "キーボード", "マウス", "モニター", "USBケーブル"];
  }

  function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function getSortedList(list) {
    const copiedList = [...list];
    const sortType = sortSelect.value;

    if (sortType === "asc") {
      copiedList.sort(function (a, b) {
        return a.localeCompare(b, "ja");
      });
    } else if (sortType === "desc") {
      copiedList.sort(function (a, b) {
        return b.localeCompare(a, "ja");
      });
    }

    return copiedList;
  }

  function render(list) {
    productList.innerHTML = "";

    const sortedList = getSortedList(list);

    if (sortedList.length === 0) {
      productList.innerHTML = '<li class="product__item">該当なし</li>';
      return;
    }

    for (const name of sortedList) {
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
          saveProducts();
        }

        render(products);
      });

      li.appendChild(span);
      li.appendChild(deleteButton);
      productList.appendChild(li);
    }
  }

  function showMessage(message) {
    addMessage.textContent = message;
  }

  function clearMessage() {
    addMessage.textContent = "";
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

  resetButton.addEventListener("click", function () {
    searchInput.value = "";
    render(products);
  });

  sortSelect.addEventListener("change", function () {
    render(products);
  });

  addForm.addEventListener("submit", function (event) {
    event.preventDefault();
  });

  addButton.addEventListener("click", function (event) {
    event.preventDefault();

    const newProduct = addInput.value.trim();

    clearMessage();

    if (newProduct === "") {
      showMessage("商品名を入力してください。");
      return;
    }

    const isDuplicate = products.some(function (product) {
      return product === newProduct;
    });

    if (isDuplicate) {
      showMessage("同じ商品名は追加できません。");
      return;
    }

    products.push(newProduct);
    saveProducts();
    render(products);

    addInput.value = "";
    showMessage("商品を追加しました。");
  });
});