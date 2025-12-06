document.addEventListener("DOMContentLoaded", () => {
  const titleEl = document.getElementById("conversationTitle");
  const windowEl = document.getElementById("messagesWindow");
  const inputEl = document.getElementById("messageInput");
  const sendBtn = document.getElementById("sendMessageBtn");

  if (!titleEl || !windowEl || !inputEl || !sendBtn) {
    console.warn("Messages page elements not found.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("productId"), 10);

  if (!isNaN(productId)) {
    const product = getProductById(productId);
    if (product) {
      titleEl.textContent = `Conversation about: ${product.title}`;
      windowEl.innerHTML = `
        <div class="message buyer">
          You: Hi, I am interested in "${product.title}". Is it still available?
        </div>
        <div class="message seller">
          Seller: Yes, it is available. You can place the order from the product page.
        </div>
      `;
    }
  }

  function appendMessage(text, type) {
    const div = document.createElement("div");
    div.className = "message " + type;
    div.textContent = (type === "buyer" ? "You: " : "Seller: ") + text;
    windowEl.appendChild(div);
    windowEl.scrollTop = windowEl.scrollHeight;
  }

  sendBtn.addEventListener("click", () => {
    const text = inputEl.value.trim();
    if (!text) return;

    appendMessage(text, "buyer");
    inputEl.value = "";

    // Demo auto-reply from seller
    setTimeout(() => {
      appendMessage("Thanks for your message, I will get back to you soon.", "seller");
    }, 800);
  });
});
