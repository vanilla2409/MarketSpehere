// Demo login logic for MarketWeave
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const role = document.getElementById("role").value;

    if (!fullName || !email) {
      alert("Please fill in all fields.");
      return;
    }

    const user = {
      name: fullName,
      email: email,
      role: role
    };

    setCurrentUser(user);

    alert(`Logged in as ${fullName} (${role}) — demo only, actual auth will use Users table in DB.`);
    window.location.href = "index.html";
  });
});
