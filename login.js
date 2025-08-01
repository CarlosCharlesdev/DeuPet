// Login functionality
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  const registerBtn = document.getElementById("registerBtn")
  const errorMessage = document.getElementById("errorMessage")

  // Check if user is already logged in
  const currentUser = localStorage.getItem("currentUser")
  if (currentUser) {
    const user = JSON.parse(currentUser)
    redirectUser(user)
  }

  // Handle login form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const email = document.getElementById("email").value
    const password = document.getElementById("password").value
    const rememberMe = document.getElementById("rememberMe").checked

    // Show loading state
    const loginBtn = document.getElementById("loginBtn")
    loginBtn.classList.add("loading")
    loginBtn.disabled = true

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const result = await response.json()

      if (result.success) {
        // Store user data
        localStorage.setItem("currentUser", JSON.stringify(result.user))

        // Redirect based on user type
        redirectUser(result.user)
      } else {
        showError(result.message || "Erro ao fazer login")
      }
    } catch (error) {
      console.error("Login error:", error)
      showError("Erro de conexão. Tente novamente.")
    } finally {
      // Hide loading state
      loginBtn.classList.remove("loading")
      loginBtn.disabled = false
    }
  })

  // Handle register button
  registerBtn.addEventListener("click", () => {
    window.location.href = "/register.html"
  })

  function redirectUser(user) {
    if (user.type === "ong") {
      window.location.href = "/admin.html"
    } else {
      window.location.href = "/index.html"
    }
  }

  function showError(message) {
    errorMessage.textContent = message
    errorMessage.style.display = "block"

    // Hide error after 5 seconds
    setTimeout(() => {
      errorMessage.style.display = "none"
    }, 5000)
  }
})
