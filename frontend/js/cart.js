document.addEventListener("DOMContentLoaded", () => {
  const cartItemsEl = document.getElementById("cartItems");
  const cartTotalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutMessage = document.getElementById("checkoutMessage");

  function renderCart() {
    const cart = getCart();
    cartItemsEl.innerHTML = "";

    if (!cart.length) {
      cartItemsEl.innerHTML = "<p>Your cart is empty.</p>";
      cartTotalEl.textContent = "0";
      return;
    }

    let total = 0;

    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-item-row";

      const itemTotal = item.price * item.qty;
      total += itemTotal;

      row.innerHTML = `
        <div class="cart-item-title">${item.title}</div>
        <div>₹${item.price}</div>
        <div>
          <button class="btn" data-action="minus" data-id="${item.id}">−</button>
          <span style="margin: 0 8px;">${item.qty}</span>
          <button class="btn" data-action="plus" data-id="${item.id}">+</button>
        </div>
        <div>₹${itemTotal}</div>
      `;

      cartItemsEl.appendChild(row);
    });

    cartTotalEl.textContent = total;

    // Attach quantity buttons
    cartItemsEl.querySelectorAll("button[data-action]").forEach(btn => {
      btn.addEventListener("click", e => {
        const id = parseInt(e.target.getAttribute("data-id"), 10);
        const action = e.target.getAttribute("data-action");
        updateQuantity(id, action);
      });
    });
  }

  function updateQuantity(productId, action) {
    let cart = getCart();
    const item = cart.find(i => i.id === productId);
    if (!item) return;

    if (action === "plus") {
      item.qty += 1;
    } else if (action === "minus") {
      item.qty -= 1;
      if (item.qty <= 0) {
        cart = cart.filter(i => i.id !== productId);
      }
    }

    saveCart(cart);
    renderCart();
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cart = getCart();
      if (!cart.length) {
        checkoutMessage.textContent = "Cart is empty. Add items before placing an order.";
        return;
      }

      // Demo checkout: just clear cart and show message
      saveCart([]);
      renderCart();
      checkoutMessage.textContent =
        "Order placed successfully! (Demo: real checkout will insert into Orders, OrderItems, and update stock in DB.)";
    });
  }

  renderCart();
});
