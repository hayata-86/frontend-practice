const form = document.querySelector(".search__form");
const input = document.querySelector(".search__input");
const productList = document.querySelector("#productList");

// 表示するデータ（本来はAPI/DB。今日は固定でOK）
const products = ["ノートPC", "キーボード", "マウス", "モニター", "USBケーブル"];

// 画面にリストを描画する関数
function render(list) {
  productList.innerHTML = ""; // 一旦空にする

  if (list.length === 0) {
    productList.innerHTML = `<li class="product__item">該当なし</li>`;
    return;
  }

  for (const name of list) {
    const li = document.createElement("li");
    li.className = "product__item";
    li.textContent = name;
    productList.appendChild(li);
  }
}

// 最初の表示
render(products);

form.addEventListener("submit", function (event) {
  event.preventDefault();

  const keyword = input.value.trim();

  const filtered = products.filter((p) => p.includes(keyword));

  render(filtered);
});