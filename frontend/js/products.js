// Home page product listing + search/filter + product detail page

document.addEventListener("DOMContentLoaded", () => {
  const productsGrid = document.getElementById("productsGrid");
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const productDetail = document.getElementById("productDetail");

  // If we're on the home page (products grid)
  if (productsGrid) {
    function renderProducts(list) {
      productsGrid.innerHTML = "";
      if (!list.length) {
        productsGrid.innerHTML = "<p>No products found.</p>";
        return;
      }

      list.forEach(p => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
          <img src="${p.image}" alt="${p.title}">
          <h3>${p.title}</h3>
          <p>₹${p.price}</p>
          <p><small>${p.category} • ⭐ ${p.rating}</small></p>
          <button class="btn btn-primary" data-id="${p.id}">
            Add to Cart
          </button>
          <button class="btn" data-view-id="${p.id}">
            View Details
          </button>
        `;
        productsGrid.appendChild(card);
      });

      // Attach button handlers
      productsGrid.querySelectorAll("button[data-id]").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = parseInt(e.target.getAttribute("data-id"), 10);
          addToCart(id);
        });
      });

      productsGrid.querySelectorAll("button[data-view-id]").forEach(btn => {
        btn.addEventListener("click", e => {
          const id = parseInt(e.target.getAttribute("data-view-id"), 10);
          window.location.href = `product.html?id=${id}`;
        });
      });
    }

    function applyFilters() {
      const searchText = (searchInput?.value || "").toLowerCase();
      const category = categoryFilter?.value || "";

      let filtered = mockProducts.filter(p =>
        p.title.toLowerCase().includes(searchText)
      );

      if (category) {
        filtered = filtered.filter(p => p.category === category);
      }

      renderProducts(filtered);
    }

    renderProducts(mockProducts);
    if (searchInput) searchInput.addEventListener("input", applyFilters);
    if (categoryFilter) categoryFilter.addEventListener("change", applyFilters);
  }

  // If we're on the product detail page
  if (productDetail) {
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get("id"), 10);
    const product = getProductById(id);

    if (!product) {
      productDetail.innerHTML = "<p>Product not found.</p>";
      return;
    }

    productDetail.innerHTML = `
      <div>
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div>
        <h1>${product.title}</h1>
        <p><strong>Price:</strong> ₹${product.price}</p>
        <p><strong>Category:</strong> ${product.category}</p>
        <p><strong>Rating:</strong> ⭐ ${product.rating}</p>
        <p>
          This is a demo description for ${product.title}. In the real system,
          we will load description, seller name, and reviews from the database.
        </p>
        <button class="btn btn-primary" id="detailAddToCart">Add to Cart</button>
        <button class="btn" id="messageSellerBtn">Message Seller</button>

      </div>
    `;

       const addBtn = document.getElementById("detailAddToCart");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        addToCart(product.id);
      });
    }

    const msgBtn = document.getElementById("messageSellerBtn");
    if (msgBtn) {
      msgBtn.addEventListener("click", () => {
        window.location.href = `messages.html?productId=${product.id}`;
      });
    }
  }
});
