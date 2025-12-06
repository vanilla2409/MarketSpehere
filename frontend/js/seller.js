document.addEventListener("DOMContentLoaded", () => {
  const sellerProductCountEl = document.getElementById("sellerProductCount");
  const sellerProductsGrid = document.getElementById("sellerProductsGrid");

  if (!sellerProductsGrid || !sellerProductCountEl) {
    console.warn("Seller dashboard elements not found.");
    return;
  }

  // For demo, assume all mockProducts belong to this seller.
  const sellerProducts = mockProducts;

  sellerProductCountEl.textContent = sellerProducts.length;

  sellerProductsGrid.innerHTML = "";
  sellerProducts.forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
      <img src="${p.image}" alt="${p.title}">
      <h3>${p.title}</h3>
      <p>₹${p.price}</p>
      <p><small>${p.category}</small></p>
      <button class="btn">Edit (Demo)</button>
      <button class="btn">Delete (Demo)</button>
    `;
    sellerProductsGrid.appendChild(card);
  });
});
