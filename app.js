console.log("app.js loaded");

window.addEventListener("DOMContentLoaded", function () {
  const searchForm = document.querySelector(".search__form");
  const searchInput = document.querySelector(".search__input");
  const productList = document.querySelector("#productList");
  const resetButton = document.querySelector(".reset-button");
  const sortSelect = document.querySelector("#sortSelect");
  const statusFilter = document.querySelector("#statusFilter");
  const clearCompletedButton = document.querySelector("#clearCompletedButton");
  const exportCsvButton = document.querySelector("#exportCsvButton");

  const totalCount = document.querySelector("#totalCount");
  const visibleCount = document.querySelector("#visibleCount");
  const completedCount = document.querySelector("#completedCount");
  const activeCount = document.querySelector("#activeCount");

  const addForm = document.querySelector(".add-form");
  const addInput = document.querySelector(".add-input");
  const addButton = document.querySelector(".add-button");
  const addMessage = document.querySelector(".add-message");

  const STORAGE_KEY = "products";

  let products = loadProducts();
  let currentList = [...products];
  let editingProduct = null;
  let draggedProductName = null;

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

  function updateCurrentList() {
    const keyword = searchInput.value.trim();
    const status = statusFilter.value;

    currentList = products.filter(function (product) {
      const matchesKeyword = product.name.includes(keyword);

      let matchesStatus = true;

      if (status === "active") {
        matchesStatus = product.completed === false;
      } else if (status === "completed") {
        matchesStatus = product.completed === true;
      }

      return matchesKeyword && matchesStatus;
    });
  }

  function updateSummary() {
    totalCount.textContent = products.length;
    visibleCount.textContent = currentList.length;

    const completedProducts = products.filter(function (product) {
      return product.completed === true;
    });
    completedCount.textContent = completedProducts.length;

    const activeProducts = products.filter(function (product) {
      return product.completed === false;
    });
    activeCount.textContent = activeProducts.length;
  }

  function showMessage(message) {
    addMessage.textContent = message;
  }

  function clearMessage() {
    addMessage.textContent = "";
  }

  function exportProductsToCsv() {
    if (products.length === 0) {
      showMessage("出力できる商品がありません。");
      return;
    }

    const header = ["商品名", "状態"];
    const rows = products.map(function (product) {
      return [
        `"${product.name}"`,
        product.completed ? "完了" : "未完了"
      ];
    });

    const csvContent = [
      header.join(","),
      ...rows.map(function (row) {
        return row.join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "products.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showMessage("CSVを出力しました。");
  }

  function moveProductBefore(draggedName, targetName) {
    if (draggedName === targetName) {
      return;
    }

    const draggedIndex = products.findIndex(function (product) {
      return product.name === draggedName;
    });

    const targetIndex = products.findIndex(function (product) {
      return product.name === targetName;
    });

    if (draggedIndex === -1 || targetIndex === -1) {
      return;
    }

    const draggedItem = products[draggedIndex];
    products.splice(draggedIndex, 1);

    const newTargetIndex = products.findIndex(function (product) {
      return product.name === targetName;
    });

    products.splice(newTargetIndex, 0, draggedItem);

    saveProducts();
    updateCurrentList();
    render(currentList);
    showMessage("並び順を変更しました。");
  }

  function render(list) {
    productList.innerHTML = "";

    const sortedList = getSortedList(list);

    updateSummary();

    if (sortedList.length === 0) {
      productList.innerHTML = '<li class="product__item">該当なし</li>';
      return;
    }

    const isDraggableMode = sortSelect.value === "default";

    for (const product of sortedList) {
      const li = document.createElement("li");
      li.className = "product__item";

      if (product.completed) {
        li.classList.add("product__item--completed");
      }

      if (isDraggableMode) {
        li.draggable = true;
        li.classList.add("product__item--draggable");

        li.addEventListener("dragstart", function () {
          draggedProductName = product.name;
          li.classList.add("product__item--dragging");
        });

        li.addEventListener("dragend", function () {
          draggedProductName = null;
          li.classList.remove("product__item--dragging");
        });

        li.addEventListener("dragover", function (event) {
          event.preventDefault();
        });

        li.addEventListener("drop", function (event) {
          event.preventDefault();

          if (!draggedProductName) {
            return;
          }

          moveProductBefore(draggedProductName, product.name);
        });
      }

      const leftArea = document.createElement("div");
      leftArea.className = "product__left-area";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = product.completed;

      checkbox.addEventListener("change", function () {
        product.completed = checkbox.checked;
        saveProducts();
        updateCurrentList();
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
          updateCurrentList();
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

          updateCurrentList();
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

  updateCurrentList();
  render(currentList);

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    editingProduct = null;
    updateCurrentList();
    render(currentList);
  });

  resetButton.addEventListener("click", function () {
    searchInput.value = "";
    statusFilter.value = "all";
    editingProduct = null;
    updateCurrentList();
    render(currentList);
  });

  sortSelect.addEventListener("change", function () {
    render(currentList);

    if (sortSelect.value === "default") {
      showMessage("ドラッグ＆ドロップで並び替えできます。");
    } else {
      showMessage("昇順・降順表示中はドラッグ並び替えできません。");
    }
  });

  statusFilter.addEventListener("change", function () {
    editingProduct = null;
    updateCurrentList();
    render(currentList);
  });

  exportCsvButton.addEventListener("click", function () {
    exportProductsToCsv();
  });

  clearCompletedButton.addEventListener("click", function () {
    const hasCompleted = products.some(function (product) {
      return product.completed === true;
    });

    if (!hasCompleted) {
      showMessage("削除できる完了済み商品がありません。");
      return;
    }

    products = products.filter(function (product) {
      return product.completed === false;
    });

    saveProducts();

    if (editingProduct !== null) {
      const stillExists = products.some(function (product) {
        return product.name === editingProduct;
      });

      if (!stillExists) {
        editingProduct = null;
      }
    }

    updateCurrentList();
    render(currentList);
    showMessage("完了済み商品を一括削除しました。");
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
    updateCurrentList();
    render(currentList);

    addInput.value = "";
    showMessage("商品を追加しました。");
  });
});