// Admin panel functionality
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))

  // Check if user is logged in and is ONG
  if (!currentUser || currentUser.type !== "ong") {
    window.location.href = "/login.html"
    return
  }

  // Initialize admin panel
  init()

  async function init() {
    displayUserInfo()
    loadStats()
    loadAnimals()
    setupEventListeners()
  }

  function displayUserInfo() {
    document.getElementById("userName").textContent = currentUser.name || currentUser.email
  }

  async function loadStats() {
    try {
      const response = await fetch("/api/stats")
      const stats = await response.json()

      if (stats.success) {
        document.getElementById("totalDogs").textContent = stats.data.dogs || 0
        document.getElementById("totalCats").textContent = stats.data.cats || 0
        document.getElementById("totalAdopted").textContent = stats.data.adopted || 0
        document.getElementById("totalInterested").textContent = stats.data.interested || 0
      }
    } catch (error) {
      console.error("Error loading stats:", error)
    }
  }

  async function loadAnimals() {
    try {
      const response = await fetch("/api/animals")
      const result = await response.json()

      if (result.success) {
        displayAnimals(result.animals)
      }
    } catch (error) {
      console.error("Error loading animals:", error)
    }
  }

  function displayAnimals(animals) {
    const animalsGrid = document.getElementById("animalsGrid")

    if (animals.length === 0) {
      animalsGrid.innerHTML =
        '<p style="text-align: center; color: #6b7280; grid-column: 1 / -1;">Nenhum animal cadastrado ainda.</p>'
      return
    }

    animalsGrid.innerHTML = animals
      .map(
        (animal) => `
            <div class="animal-card">
                <img src="${animal.image || `/placeholder.svg?height=200&width=300&text=${animal.name}+${animal.breed}`}" 
                     alt="${animal.name}" class="animal-image">
                <div class="animal-info">
                    <h3 class="animal-name">${animal.type === "dog" ? "🐕" : "🐱"} ${animal.name}</h3>
                    <div class="animal-details">
                        <div>📅 ${animal.age} • 📏 ${animal.size}</div>
                        <div>🏠 ${animal.breed} • 📍 ${animal.location}</div>
                    </div>
                    <div class="animal-characteristics">
                        ${animal.characteristics.map((char) => `<span class="animal-characteristic">${char}</span>`).join("")}
                    </div>
                    <p class="animal-bio">${animal.bio}</p>
                    <div class="animal-actions">
                        <button class="edit-btn" onclick="editAnimal(${animal.id})">✏️ Editar</button>
                        <button class="delete-btn" onclick="deleteAnimal(${animal.id})">🗑️ Excluir</button>
                    </div>
                </div>
            </div>
        `,
      )
      .join("")
  }

  function setupEventListeners() {
    // Logout button
    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("currentUser")
      window.location.href = "/login.html"
    })

    // Pet form submission
    document.getElementById("petForm").addEventListener("submit", async (e) => {
      e.preventDefault()

      const formData = new FormData(e.target)
      const petData = {
        name: formData.get("name"),
        age: formData.get("age"),
        type: formData.get("type"),
        breed: formData.get("breed"),
        size: formData.get("size"),
        location: formData.get("location"),
        characteristics: formData
          .get("characteristics")
          .split(",")
          .map((c) => c.trim()),
        bio: formData.get("bio"),
        image: formData.get("image") || null,
        ongId: currentUser.id,
      }

      // Show loading state
      const submitBtn = document.getElementById("submitBtn")
      submitBtn.classList.add("loading")
      submitBtn.disabled = true

      try {
        const response = await fetch("/api/animals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(petData),
        })

        const result = await response.json()

        if (result.success) {
          // Reset form
          e.target.reset()

          // Reload animals and stats
          loadAnimals()
          loadStats()

          alert("Animal cadastrado com sucesso!")
        } else {
          alert("Erro ao cadastrar animal: " + result.message)
        }
      } catch (error) {
        console.error("Error adding animal:", error)
        alert("Erro de conexão. Tente novamente.")
      } finally {
        // Hide loading state
        submitBtn.classList.remove("loading")
        submitBtn.disabled = false
      }
    })
  }

  // Global functions for animal actions
  window.editAnimal = (id) => {
    // TODO: Implement edit functionality
    alert("Funcionalidade de edição em desenvolvimento")
  }

  window.deleteAnimal = async (id) => {
    if (!confirm("Tem certeza que deseja excluir este animal?")) {
      return
    }

    try {
      const response = await fetch(`/api/animals/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        loadAnimals()
        loadStats()
        alert("Animal excluído com sucesso!")
      } else {
        alert("Erro ao excluir animal: " + result.message)
      }
    } catch (error) {
      console.error("Error deleting animal:", error)
      alert("Erro de conexão. Tente novamente.")
    }
  }
})
