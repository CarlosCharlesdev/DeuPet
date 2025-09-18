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
    loadMatches()
    loadChats()
    setupEventListeners()
    setupMatchesAndChats()
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
      // Fallback with mock data
      document.getElementById("totalDogs").textContent = "3"
      document.getElementById("totalCats").textContent = "2"
      document.getElementById("totalAdopted").textContent = "8"
      document.getElementById("totalInterested").textContent = "15"
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
      // Fallback with mock data
      const mockAnimals = [
        {
          id: 1,
          name: "Sasha",
          age: "2 anos",
          breed: "Golden Retriever",
          location: "São Paulo, SP",
          image: "/placeholder.svg?height=200&width=300&text=Sasha+Golden+Retriever",
          characteristics: ["Carinhosa", "Brincalhona", "Obediente"],
          bio: "Oi! Sou a Sasha e adoro brincar no parque. Sou muito carinhosa e amo fazer novos amigos.",
          size: "Grande",
          type: "dog",
        },
        {
          id: 2,
          name: "Max",
          age: "4 anos",
          breed: "Labrador",
          location: "Rio de Janeiro, RJ",
          image: "/placeholder.svg?height=200&width=300&text=Max+Labrador",
          characteristics: ["Leal", "Energético", "Inteligente"],
          bio: "Eu sou o Max! Adoro nadar e correr na praia. Sou muito leal e protetor da minha família.",
          size: "Grande",
          type: "dog",
        },
      ]
      displayAnimals(mockAnimals)
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

  // Load matches data
  async function loadMatches() {
    try {
      // Mock data for matches - in real app, this would come from API
      const mockMatches = [
        {
          id: 1,
          petId: 1,
          petName: "Sasha",
          petImage: "/imagAnimais/sasha.jpg",
          clientId: 1,
          clientName: "Beatriz Eduarda",
          clientEmail: "maria@email.com",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          status: "pending",
        },
        {
          id: 2,
          petId: 2,
          petName: "Max",
          petImage: "/imagAnimais/pretinha.jpg",
          clientId: 2,
          clientName: "João Santos",
          clientEmail: "joao@email.com",
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          status: "approved",
        },
        {
          id: 3,
          petId: 3,
          petName: "Mimi",
          petImage: "/imagAnimais/carameloAdotado.webp",
          clientId: 3,
          clientName: "Ana Costa",
          clientEmail: "ana@email.com",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          status: "pending",
        },
      ]

      displayMatches(mockMatches)
      document.getElementById("matchesBadge").textContent = mockMatches.filter((m) => m.status === "pending").length
    } catch (error) {
      console.error("Error loading matches:", error)
    }
  }

  function displayMatches(matches) {
    const matchesGrid = document.getElementById("matchesGrid")

    if (matches.length === 0) {
      matchesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💕</div>
          <h3>Nenhum match ainda</h3>
          <p>Quando alguém demonstrar interesse em adotar seus pets, os matches aparecerão aqui.</p>
        </div>
      `
      return
    }

    matchesGrid.innerHTML = matches
      .map(
        (match) => `
        <div class="match-card">
          <img src="${match.petImage}" alt="${match.petName}" class="match-pet-image">
          <div class="match-info">
            <h3 class="match-pet-name">🐕 ${match.petName}</h3>
            <div class="match-client-info">
              <div class="match-client-name">👤 ${match.clientName}</div>
              <div class="match-timestamp">📅 ${formatTimestamp(match.timestamp)}</div>
              <span class="match-status ${match.status}">
                ${match.status === "pending" ? "⏳ Pendente" : "✅ Aprovado"}
              </span>
            </div>
            <div class="match-actions">
              <button class="match-action-btn chat-match-btn" onclick="openMatchChat(${match.id})">
                💬 Chat
              </button>
              <button class="match-action-btn approve-match-btn" 
                      onclick="approveMatch(${match.id})" 
                      ${match.status === "approved" ? "disabled" : ""}>
                ${match.status === "approved" ? "✅ Aprovado" : "✅ Aprovar"}
              </button>
            </div>
          </div>
        </div>
      `,
      )
      .join("")
  }

  // Load active chats
  async function loadChats() {
    try {
      // Mock data for chats - in real app, this would come from API
      const mockChats = [
        {
          id: 1,
          petId: 1,
          petName: "Sasha",
          petImage: "/imagAnimais/sasha.jpg",
          clientName: "Beatriz Eduarda",
          lastMessage: "Oi! Gostaria de saber mais sobre a Sasha. Ela é vacinada?",
          lastMessageTime: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
          unreadCount: 2,
          isActive: true,
        },
        {
          id: 2,
          petId: 2,
          petName: "Max",
          petImage: "/placeholder.svg?height=60&width=60&text=Max",
          clientName: "João Santos",
          lastMessage: "Obrigado pelas informações! Quando posso visitá-lo?",
          lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          unreadCount: 0,
          isActive: true,
        },
        {
          id: 3,
          petId: 3,
          petName: "Mimi",
          petImage: "/placeholder.svg?height=60&width=60&text=Mimi",
          clientName: "Ana Costa",
          lastMessage: "A Mimi se dá bem com outros gatos?",
          lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
          unreadCount: 1,
          isActive: true,
        },
      ]

      displayChats(mockChats)
      const totalUnread = mockChats.reduce((sum, chat) => sum + chat.unreadCount, 0)
      document.getElementById("chatsBadge").textContent = totalUnread
    } catch (error) {
      console.error("Error loading chats:", error)
    }
  }

  function displayChats(chats) {
    const chatsList = document.getElementById("chatsList")

    if (chats.length === 0) {
      chatsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">💬</div>
          <h3>Nenhum chat ativo</h3>
          <p>Quando alguém demonstrar interesse em seus pets, os chats aparecerão aqui.</p>
        </div>
      `
      return
    }

    chatsList.innerHTML = chats
      .map(
        (chat) => `
        <div class="chat-item ${chat.unreadCount > 0 ? "unread" : ""}" onclick="openOngChat(${chat.id})">
          <div class="chat-header-info">
            <img src="${chat.petImage}" alt="${chat.petName}" class="chat-pet-avatar">
            <div class="chat-info">
              <div class="chat-pet-title">🐕 ${chat.petName}</div>
              <div class="chat-client-name">👤 ${chat.clientName}</div>
            </div>
          </div>
          <div class="chat-last-message">
            <div class="chat-last-message-text">${chat.lastMessage}</div>
          </div>
          <div class="chat-meta">
            <span class="chat-time">${formatTimestamp(chat.lastMessageTime)}</span>
            ${chat.unreadCount > 0 ? `<span class="chat-unread-count">${chat.unreadCount}</span>` : ""}
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

  function setupMatchesAndChats() {
    // Tab switching
    const matchesTab = document.getElementById("matchesTab")
    const chatsTab = document.getElementById("chatsTab")
    const matchesContent = document.getElementById("matchesContent")
    const chatsContent = document.getElementById("chatsContent")

    matchesTab.addEventListener("click", () => {
      matchesTab.classList.add("active")
      chatsTab.classList.remove("active")
      matchesContent.classList.add("active")
      chatsContent.classList.remove("active")
    })

    chatsTab.addEventListener("click", () => {
      chatsTab.classList.add("active")
      matchesTab.classList.remove("active")
      chatsContent.classList.add("active")
      matchesContent.classList.remove("active")
    })

    // ONG Chat modal controls - REMOVED OVERLAY REFERENCES
    const ongChatModal = document.getElementById("ongChatModal")
    const closeOngChatBtn = document.getElementById("closeOngChatBtn")
    const ongSendBtn = document.getElementById("ongSendBtn")
    const ongChatInput = document.getElementById("ongChatInput")

    closeOngChatBtn.addEventListener("click", closeOngChatModal)

    ongSendBtn.addEventListener("click", sendOngMessage)
    ongChatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        sendOngMessage()
      }
    })

    // Close modal when clicking outside (optional)
    document.addEventListener("click", (e) => {
      if (
        ongChatModal.classList.contains("active") &&
        !ongChatModal.contains(e.target) &&
        !e.target.closest(".chat-match-btn") &&
        !e.target.closest(".chat-item")
      ) {
        closeOngChatModal()
      }
    })

    function closeOngChatModal() {
      ongChatModal.classList.remove("active")
      // Remove body overflow restriction
      document.body.style.overflow = "auto"
    }
  }

  function formatTimestamp(timestamp) {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}min atrás`
    } else if (hours < 24) {
      return `${hours}h atrás`
    } else {
      return `${days}d atrás`
    }
  }

  function addOngMessage(sender, message, senderName) {
    const messagesContainer = document.getElementById("ongChatMessages")
    const messageDiv = document.createElement("div")
    messageDiv.className = `ong-message ${sender === "ong" ? "ong-message-sent" : "client-message"}`

    messageDiv.innerHTML = `
      <div class="ong-message-content">
        <div class="ong-message-header">
          <span class="ong-sender-name">${senderName}</span>
          <span class="ong-message-time">${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        <div class="ong-message-text">${message}</div>
      </div>
    `

    messagesContainer.appendChild(messageDiv)

    // Força o scroll para o final - MÚLTIPLAS TENTATIVAS
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }, 10)

    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }, 100)

    // Scroll suave para o final
    messagesContainer.scrollTo({
      top: messagesContainer.scrollHeight,
      behavior: "smooth",
    })
  }

  // Global functions for match and chat actions
  window.openMatchChat = (matchId) => {
    console.log("Opening chat for match:", matchId)
    openOngChat(matchId)
  }

  window.approveMatch = async (matchId) => {
    if (!confirm("Tem certeza que deseja aprovar esta adoção?")) {
      return
    }

    try {
      // In real app, this would be an API call
      console.log("Approving match:", matchId)
      alert("Adoção aprovada com sucesso! O cliente será notificado.")

      // Reload matches to update status
      loadMatches()
    } catch (error) {
      console.error("Error approving match:", error)
      alert("Erro ao aprovar adoção. Tente novamente.")
    }
  }

  window.openOngChat = (chatId) => {
    console.log("Opening ONG chat:", chatId)

    // Mock data for the specific chat
    const chatData = {
      petName: "Sasha",
      petImage: "/imagAnimais/sasha.jpg",
      clientName: "Beatriz Eduarda",
    }

    // Fill chat modal with data
    document.getElementById("chatPetImage").src = chatData.petImage
    document.getElementById("chatPetName").textContent = chatData.petName
    document.getElementById("chatClientName").textContent = chatData.clientName

    // Clear previous messages
    const messagesContainer = document.getElementById("ongChatMessages")
    messagesContainer.innerHTML = ""

    // Add multiple mock messages to test scroll
    addOngMessage("client", "Oi! Vi a Sasha no PetMatch e me interessei. Ela é muito fofa!", "Beatriz Eduarda")
    addOngMessage("client", "Gostaria de saber mais sobre ela. Ela é vacinada?", "Beatriz Eduarda")
    addOngMessage(
      "ong",
      "Olá Maria! Que bom que se interessou pela Sasha! Sim, ela está com todas as vacinas em dia.",
      "ONG Amigos dos Animais",
    )
    addOngMessage("client", "Que ótimo! E ela se dá bem com crianças?", "Beatriz Eduarda")
    addOngMessage("ong", "Sim! A Sasha adora crianças. Ela é muito dócil e brincalhona.", "ONG Amigos dos Animais")
    addOngMessage("client", "Perfeito! Tenho dois filhos pequenos. Quando posso conhecê-la?", "Beatriz Eduarda")
    addOngMessage(
      "ong",
      "Que maravilha! Podemos agendar uma visita. Vocês podem vir no fim de semana?",
      "ONG Amigos dos Animais",
    )
    addOngMessage("client", "Sim! Sábado de manhã seria ideal para nós.", "Beatriz Eduarda")
    addOngMessage("ong", "Perfeito! Sábado às 10h então. Vou enviar o endereço por aqui.", "ONG Amigos dos Animais")
    addOngMessage("client", "Combinado! Estamos muito animados para conhecer a Sasha!", "Beatriz Eduarda")

    // Show modal - REMOVED OVERLAY REFERENCE
    const modal = document.getElementById("ongChatModal")
    modal.classList.add("active")

    // Focus on input
    document.getElementById("ongChatInput").focus()

    // Garantir scroll no final após carregar
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight
    }, 300)
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

  // Declare sendOngMessage function
  function sendOngMessage() {
    // TODO: Implement send message functionality
    alert("Funcionalidade de enviar mensagem em desenvolvimento")
  }
})
