// Register functionality
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm")
  const errorMessage = document.getElementById("errorMessage")
  const successMessage = document.getElementById("successMessage")

  // Handle register form submission
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    const formData = new FormData(registerForm)
    const userData = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      city: formData.get("city"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    }

    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
      showError("As senhas não coincidem")
      return
    }

    // Validate password length
    if (userData.password.length < 6) {
      showError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    // Show loading state
    const registerBtn = document.getElementById("registerSubmitBtn")
    registerBtn.classList.add("loading")
    registerBtn.disabled = true

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const result = await response.json()

      if (result.success) {
        showSuccess("Conta criada com sucesso! Redirecionando...")

        // Store user data and redirect
        localStorage.setItem("currentUser", JSON.stringify(result.user))

        setTimeout(() => {
          window.location.href = "/index.html"
        }, 2000)
      } else {
        showError(result.message || "Erro ao criar conta")
      }
    } catch (error) {
      console.error("Register error:", error)
      showError("Erro de conexão. Tente novamente.")
    } finally {
      // Hide loading state
      registerBtn.classList.remove("loading")
      registerBtn.disabled = false
    }
  })

  function showError(message) {
    errorMessage.textContent = message
    errorMessage.style.display = "block"
    successMessage.style.display = "none"

    // Hide error after 5 seconds
    setTimeout(() => {
      errorMessage.style.display = "none"
    }, 5000)
  }

  function showSuccess(message) {
    successMessage.textContent = message
    successMessage.style.display = "block"
    errorMessage.style.display = "none"
  }
})
