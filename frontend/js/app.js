// ---------- Common mock data (products for buying & selling demo) ----------
const mockProducts = [
  {
    id: 1,
    title: "Smartphone X",
    price: 19999,
    category: "Electronics",
    rating: 4.5,
    image: "https://placehold.co/300x200/111827/ffffff?text=Smartphone+X"
  },
  {
    id: 2,
    title: "Spiral Notebook A5",
    price: 149,
    category: "Stationery",
    rating: 5,
    image: "https://placehold.co/300x200/1e293b/ffffff?text=Notebook+A5"
  },
  {
    id: 3,
    title: "Data Structures Book",
    price: 599,
    category: "Books",
    rating: 4.2,
    image: "https://placehold.co/300x200/374151/ffffff?text=DS+Book"
  },
  {
    id: 4,
    title: "Wireless Headphones",
    price: 2999,
    category: "Electronics",
    rating: 4.3,
    image: "https://placehold.co/300x200/0f172a/ffffff?text=Headphones"
  },
  {
    id: 5,
    title: "Laptop Sleeve 15.6\"",
    price: 899,
    category: "Electronics",
    rating: 4.1,
    image: "https://placehold.co/300x200/0f766e/ffffff?text=Laptop+Sleeve"
  },
  {
    id: 6,
    title: "Mechanical Keyboard",
    price: 3499,
    category: "Electronics",
    rating: 4.7,
    image: "https://placehold.co/300x200/7c2d12/ffffff?text=Keyboard"
  },
  {
    id: 7,
    title: "Graphic T-Shirt",
    price: 599,
    category: "Fashion",
    rating: 4.0,
    image: "https://placehold.co/300x200/92400e/ffffff?text=T-Shirt"
  },
  {
    id: 8,
    title: "Ceramic Coffee Mug",
    price: 299,
    category: "Home",
    rating: 4.6,
    image: "https://placehold.co/300x200/4b5563/ffffff?text=Coffee+Mug"
  },
  {
    id: 9,
    title: "10,000 mAh Power Bank",
    price: 1299,
    category: "Electronics",
    rating: 4.4,
    image: "https://placehold.co/300x200/1d4ed8/ffffff?text=Power+Bank"
  },
  {
    id: 10,
    title: "Bluetooth Speaker Mini",
    price: 1999,
    category: "Electronics",
    rating: 4.3,
    image: "https://placehold.co/300x200/7e22ce/ffffff?text=Speaker"
  }
];


// ---------- Cart helpers ----------
function getCart() {
  const raw = localStorage.getItem("mw_cart");
  return raw ? JSON.parse(raw) : [];
}

function saveCart(cart) {
  localStorage.setItem("mw_cart", JSON.stringify(cart));
  updateNavCartCount();
}

function addToCart(productId) {
  const product = mockProducts.find(p => p.id === productId);
  if (!product) return;

  let cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: product.id, title: product.title, price: product.price, qty: 1 });
  }
  saveCart(cart);
  alert("Added to cart: " + product.title);
}

function updateNavCartCount() {
  const el = document.getElementById("navCartCount");
  if (!el) return;
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  el.textContent = count;
}

function getProductById(id) {
  return mockProducts.find(p => p.id === id);
}

// ---------- Auth helpers (demo Buyer/Seller login) ----------
function getCurrentUser() {
  const raw = localStorage.getItem("mw_user");
  return raw ? JSON.parse(raw) : null;
}

function setCurrentUser(user) {
  localStorage.setItem("mw_user", JSON.stringify(user));
  updateAuthLink();
}

function clearCurrentUser() {
  localStorage.removeItem("mw_user");
  updateAuthLink();
}

function updateAuthLink() {
  const link = document.getElementById("navAuthLink");
  if (!link) return;

  const user = getCurrentUser();
  if (user) {
    link.textContent = `Logout (${user.role})`;
  } else {
    link.textContent = "Login";
  }
}

// ---------- Initial setup ----------
document.addEventListener("DOMContentLoaded", () => {
  updateNavCartCount();
  updateAuthLink();

  const authLink = document.getElementById("navAuthLink");
  if (authLink) {
    authLink.addEventListener("click", (e) => {
      const user = getCurrentUser();
      if (user) {
        e.preventDefault();
        clearCurrentUser();
        alert("Logged out (demo).");
        window.location.href = "index.html";
      }
      // If not logged in, it will go to login.html as normal
    });
  }
});
