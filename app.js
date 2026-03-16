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
  let currentList = [...products];
  let editingProduct = null;

  function loadProducts() {
    const savedProducts = localStorage.getItem(STORAGE_KEY);

    if (savedProducts) {
      return JSON.parse(savedProducts);
    }

    return [
      { name: "ノートPC", completed: false },
      { name: "キーボード", completed: false },
      { name: "マウス", completed: false },
      { name: "モニター", completed: false },
      { name: "USBケーブル", completed: false }
    ];
  }

  function saveProducts() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }

  function getSortedList(list) {
    const copiedList = [...list];
    const sortType = sortSelect.value;

    if (sortType === "asc") {
      copiedList.sort(function (a, b) {
        return a.name.localeCompare(b.name, "ja");
      });
    } else if (sortType === "desc") {
      copiedList.sort(function (a, b) {
        return b.name.localeCompare(a.name, "ja");
      });
    }

    return copiedList;
  }

  function updateCurrentListByKeyword() {
    const keyword = searchInput.value.trim();

    currentList = products.filter(function (product) {
      return product.name.includes(keyword);
    });
  }

  function showMessage(message) {
    addMessage.textContent = message;
  }

  function clearMessage() {
    addMessage.textContent = "";
  }

  function render(list) {
    productList.innerHTML = "";

    const sortedList = getSortedList(list);

    if (sortedList.length === 0) {
      productList.innerHTML = '<li class="product__item">該当なし</li>';
      return;
    }

    for (const product of sortedList) {
      const li = document.createElement("li");
      li.className = "product__item";

      if (product.completed) {
        li.classList.add("product__item--completed");
      }

      const leftArea = document.createElement("div");
      leftArea.className = "product__left-area";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = product.completed;

      checkbox.addEventListener("change", function () {
        product.completed = checkbox.checked;
        saveProducts();
        updateCurrentListByKeyword();
        render(currentList);
      });

      if (editingProduct === product.name) {
        const editInput = document.createElement("input");
        editInput.className = "edit-input";
        editInput.value = product.name;

        const buttonArea = document.createElement("div");
        buttonArea.className = "product__button-area";

        const saveButton = document.createElement("button");
        saveButton.className = "save-button";
        saveButton.textContent = "保存";

        saveButton.addEventListener("click", function () {
          const trimmedName = editInput.value.trim();

          if (trimmedName === "") {
            showMessage("商品名を入力してください。");
            return;
          }

          const isDuplicate = products.some(function (item) {
            return item.name === trimmedName && item.name !== product.name;
          });

          if (isDuplicate) {
            showMessage("同じ商品名は設定できません。");
            return;
          }

          product.name = trimmedName;
          saveProducts();

          editingProduct = null;
          updateCurrentListByKeyword();
          render(currentList);
          showMessage("商品名を変更しました。");
        });

        const cancelButton = document.createElement("button");
        cancelButton.className = "cancel-button";
        cancelButton.textContent = "キャンセル";

        cancelButton.addEventListener("click", function () {
          editingProduct = null;
          render(currentList);
          clearMessage();
        });

        buttonArea.appendChild(saveButton);
        buttonArea.appendChild(cancelButton);

        leftArea.appendChild(checkbox);
        leftArea.appendChild(editInput);

        li.appendChild(leftArea);
        li.appendChild(buttonArea);
      } else {
        const span = document.createElement("span");
        span.textContent = product.name;
        span.className = "product__name";

        const buttonArea = document.createElement("div");
        buttonArea.className = "product__button-area";

        const editButton = document.createElement("button");
        editButton.className = "edit-button";
        editButton.textContent = "編集";

        editButton.addEventListener("click", function () {
          editingProduct = product.name;
          clearMessage();
          render(currentList);
        });

        const deleteButton = document.createElement("button");
        deleteButton.className = "delete-button";
        deleteButton.textContent = "削除";

        deleteButton.addEventListener("click", function () {
          products = products.filter(function (item) {
            return item.name !== product.name;
          });

          saveProducts();

          if (editingProduct === product.name) {
            editingProduct = null;
          }

          updateCurrentListByKeyword();
          render(currentList);
          showMessage("商品を削除しました。");
        });

        buttonArea.appendChild(editButton);
        buttonArea.appendChild(deleteButton);

        leftArea.appendChild(checkbox);
        leftArea.appendChild(span);

        li.appendChild(leftArea);
        li.appendChild(buttonArea);
      }

      productList.appendChild(li);
    }
  }

  render(currentList);

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    editingProduct = null;
    updateCurrentListByKeyword();
    render(currentList);
  });

  resetButton.addEventListener("click", function () {
    searchInput.value = "";
    editingProduct = null;
    currentList = [...products];
    render(currentList);
  });

  sortSelect.addEventListener("change", function () {
    render(currentList);
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
      return product.name === newProduct;
    });

    if (isDuplicate) {
      showMessage("同じ商品名は追加できません。");
      return;
    }

    products.push({
      name: newProduct,
      completed: false
    });

    saveProducts();

    updateCurrentListByKeyword();
    render(currentList);

    addInput.value = "";
    showMessage("商品を追加しました。");
  });
});