// Dog data
let dogs = []

// App state
let currentIndex = 0
let isAnimating = false
let adoptedCount = 0
let rejectedCount = 0

// DOM elements
const mainCard = document.getElementById("mainCard")
const dogImage = document.getElementById("dogImage")
const dogName = document.getElementById("dogName")
const dogAge = document.getElementById("dogAge")
const dogBreed = document.getElementById("dogBreed")
const dogLocation = document.getElementById("dogLocation")
const dogBio = document.getElementById("dogBio")
const sizeBadge = document.getElementById("sizeBadge")
const characteristics = document.getElementById("characteristics")
const progressContainer = document.getElementById("progressContainer")
const rejectBtn = document.getElementById("rejectBtn")
const adoptBtn = document.getElementById("adoptBtn")
const adoptedCountEl = document.getElementById("adoptedCount")
const rejectedCountEl = document.getElementById("rejectedCount")

// Touch/swipe variables
let startX = 0
let startY = 0
let currentX = 0
let currentY = 0
let isDragging = false
let hasMoved = false

// Initialize app
async function init() {
  // Check if user is logged in
  const currentUser = localStorage.getItem("currentUser")
  if (!currentUser) {
    window.location.href = "/login.html"
    return
  }

  const user = JSON.parse(currentUser)

  // Add logout button to header
  addLogoutButton()

  // Load animals from server
  await loadAnimals()

  if (dogs.length === 0) {
    showNoAnimalsMessage()
    return
  }

  createProgressDots()
  displayCurrentDog()
  setupEventListeners()
  loadStats()

  // Check if it's user's first time and show introduction
  checkFirstTimeUser(user)
}

function addLogoutButton() {
  const header = document.querySelector(".header")
  const logoutBtn = document.createElement("button")
  logoutBtn.className = "logout-header-btn"
  logoutBtn.textContent = "Sair"
  logoutBtn.onclick = () => {
    localStorage.removeItem("currentUser")
    window.location.href = "/login.html"
  }
  header.appendChild(logoutBtn)
}

async function loadAnimals() {
  try {
    const response = await fetch("/api/animals")
    const result = await response.json()

    if (result.success) {
      dogs = result.animals
    } else {
      console.error("Error loading animals:", result.message)
    }
  } catch (error) {
    console.error("Error loading animals:", error)
    // Fallback to default data if server is not available
    dogs = getDefaultAnimals()
  }
}

function getDefaultAnimals() {
  return [
    {
      id: 1,
      name: "Luna",
      age: "2 anos",
      breed: "Golden Retriever",
      location: "São Paulo, SP",
      image: "/placeholder.svg?height=400&width=400&text=Luna+Golden+Retriever",
      characteristics: ["Carinhosa", "Brincalhona", "Obediente"],
      bio: "Oi! Sou a Luna e adoro brincar no parque. Sou muito carinhosa e amo fazer novos amigos. Procuro uma família que goste de aventuras!",
      size: "Grande",
      type: "dog",
    },
    {
      id: 2,
      name: "Max",
      age: "4 anos",
      breed: "Labrador",
      location: "Rio de Janeiro, RJ",
      image: "/placeholder.svg?height=400&width=400&text=Max+Labrador",
      characteristics: ["Leal", "Energético", "Inteligente"],
      bio: "Eu sou o Max! Adoro nadar e correr na praia. Sou muito leal e protetor da minha família. Que tal me dar uma chance?",
      size: "Grande",
      type: "dog",
    },
  ]
}

function showNoAnimalsMessage() {
  const app = document.querySelector(".app")
  app.innerHTML = `
    <div class="header">
      <h1 class="title">🐕 PetMatch</h1>
      <p class="subtitle">Nenhum animal disponível no momento</p>
    </div>
    <div style="text-align: center; padding: 2rem; background: white; border-radius: 16px; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);">
      <p style="color: #6b7280; margin-bottom: 1rem;">Não há animais cadastrados para adoção no momento.</p>
      <p style="color: #6b7280;">Volte em breve para conhecer novos amigos! 🐾</p>
    </div>
  `
}

// Load stats from localStorage
function loadStats() {
  adoptedCount = Number.parseInt(localStorage.getItem("adoptedCount") || "0")
  rejectedCount = Number.parseInt(localStorage.getItem("rejectedCount") || "0")
  updateStats()
}

// Save stats to localStorage
function saveStats() {
  localStorage.setItem("adoptedCount", adoptedCount.toString())
  localStorage.setItem("rejectedCount", rejectedCount.toString())
}

// Update stats display
function updateStats() {
  adoptedCountEl.textContent = adoptedCount
  rejectedCountEl.textContent = rejectedCount
}

// Create progress dots
function createProgressDots() {
  progressContainer.innerHTML = ""
  dogs.forEach((_, index) => {
    const dot = document.createElement("div")
    dot.className = `progress-dot ${index === currentIndex ? "active" : ""}`
    progressContainer.appendChild(dot)
  })
}

// Função para truncar texto
function truncateText(text, maxLength = 80) {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + "..."
}

// Função para mostrar modal de detalhes
function showPetDetails(dog) {
  const modal = document.getElementById("petDetailsModal")
  const overlay = document.getElementById("petDetailsOverlay")
  
  // Preencher informações do modal
  document.getElementById("detailsPetImage").src = dog.image || `/placeholder.svg?height=400&width=400&text=${dog.name}+${dog.breed}`
  document.getElementById("detailsPetImage").alt = dog.name
  document.getElementById("detailsPetName").textContent = dog.name
  document.getElementById("detailsPetAge").textContent = dog.age
  document.getElementById("detailsPetBreed").textContent = dog.breed
  document.getElementById("detailsPetLocation").textContent = dog.location
  document.getElementById("detailsPetSize").textContent = dog.size
  document.getElementById("detailsSizeBadge").textContent = dog.size
  document.getElementById("detailsPetBio").textContent = dog.bio
  
  // Preencher características
  const detailsCharacteristics = document.getElementById("detailsCharacteristics")
  detailsCharacteristics.innerHTML = ""
  dog.characteristics.forEach((trait) => {
    const badge = document.createElement("span")
    badge.className = "details-characteristic-badge"
    badge.textContent = trait
    detailsCharacteristics.appendChild(badge)
  })
  
  // Mostrar modal
  modal.classList.add("active")
  overlay.classList.add("active")
  document.body.style.overflow = "hidden"
}

// Função para esconder modal de detalhes
function hidePetDetails() {
  const modal = document.getElementById("petDetailsModal")
  const overlay = document.getElementById("petDetailsOverlay")
  
  modal.classList.remove("active")
  overlay.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Display current dog
function displayCurrentDog() {
  const dog = dogs[currentIndex]

  // Add loading class
  mainCard.classList.add("loading")

  dogImage.src = dog.image || `/placeholder.svg?height=400&width=400&text=${dog.name}+${dog.breed}`
  dogImage.alt = dog.name
  dogName.textContent = dog.name
  dogAge.textContent = dog.age
  dogBreed.textContent = dog.breed
  dogLocation.textContent = dog.location
  
  // Usar texto truncado para a bio
  dogBio.textContent = truncateText(dog.bio, 100)
  
  sizeBadge.textContent = dog.size

  // Update characteristics
  characteristics.innerHTML = ""
  dog.characteristics.forEach((trait) => {
    const badge = document.createElement("span")
    badge.className = "characteristic-badge"
    badge.textContent = trait
    characteristics.appendChild(badge)
  })

  // Update progress dots
  updateProgressDots()

  // Remove loading class after image loads
  dogImage.onload = () => {
    mainCard.classList.remove("loading")
  }
  
  // Adicionar indicador visual de que é clicável
  mainCard.style.cursor = "pointer"
}

// Update progress dots
function updateProgressDots() {
  const dots = progressContainer.querySelectorAll(".progress-dot")
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex)
  })
}

// Handle action (adopt or reject)
async function handleAction(action) {
  if (isAnimating) return

  isAnimating = true

  // Update stats
  if (action === "adopt") {
    adoptedCount++
    mainCard.classList.add("swipe-right")
    
    // Mostrar DEU PET em vez de continuar imediatamente
    setTimeout(() => {
      showDeuPetCelebration(dogs[currentIndex])
    }, 500)
    
  } else {
    rejectedCount++
    mainCard.classList.add("swipe-left")
    
    // Para rejeição, continua o fluxo normal
    setTimeout(() => {
      continueToNextPet()
    }, 400)
  }

  saveStats()
  updateStats()

  // Disable buttons
  rejectBtn.disabled = true
  adoptBtn.disabled = true

  // Log action to server
  try {
    await fetch("/api/actions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        animalId: dogs[currentIndex].id,
        action: action,
        userId: JSON.parse(localStorage.getItem("currentUser")).id,
      }),
    })
  } catch (error) {
    console.error("Error logging action:", error)
  }

  console.log(`${action === "adopt" ? "❤️ Adotado" : "❌ Rejeitado"}: ${dogs[currentIndex].name}`)
}

// Nova função para continuar para o próximo pet
function continueToNextPet() {
  // Remove animation classes
  mainCard.classList.remove("swipe-left", "swipe-right", "animating")

  // Move to next dog
  currentIndex = (currentIndex + 1) % dogs.length

  // Display new dog
  displayCurrentDog()

  // Re-enable buttons
  rejectBtn.disabled = false
  adoptBtn.disabled = false

  isAnimating = false
}

// Função para mostrar celebração DEU PET
function showDeuPetCelebration(adoptedPet) {
  const modal = document.getElementById("deuPetModal")
  const overlay = document.getElementById("deuPetOverlay")
  
  // Preencher nome do pet adotado
  document.getElementById("adoptedPetName").textContent = adoptedPet.name
  
  // Mostrar modal
  modal.classList.add("active")
  overlay.classList.add("active")
  document.body.style.overflow = "hidden"
  
  // Adicionar confetes (efeito visual)
  createConfetti()
}

// Função para esconder celebração DEU PET
function hideDeuPetCelebration() {
  const modal = document.getElementById("deuPetModal")
  const overlay = document.getElementById("deuPetOverlay")
  
  modal.classList.remove("active")
  overlay.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Função para criar efeito de confetes
function createConfetti() {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff']
  
  for (let i = 0; i < 50; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div')
      confetti.className = 'confetti'
      confetti.style.left = Math.random() * 100 + 'vw'
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
      confetti.style.animationDelay = Math.random() * 3 + 's'
      document.body.appendChild(confetti)
      
      // Remove confetti after animation
      setTimeout(() => {
        confetti.remove()
      }, 3000)
    }, i * 50)
  }
}

// Função para abrir chat
function openChat(adoptedPet) {
  const modal = document.getElementById("chatModal")
  const overlay = document.getElementById("chatOverlay")
  
  // Limpar mensagens anteriores
  const messagesContainer = document.getElementById("chatMessages")
  messagesContainer.innerHTML = ""
  
  // Adicionar mensagem inicial da ONG
  addMessage("ong", `Olá! Que bom que você se interessou pelo ${adoptedPet.name}! 🐕`, "ONG Amigos dos Animais")
  addMessage("ong", "Vamos conversar sobre o processo de adoção. Você tem alguma pergunta sobre o pet?", "ONG Amigos dos Animais")
  
  // Mostrar modal
  modal.classList.add("active")
  overlay.classList.add("active")
  document.body.style.overflow = "hidden"
  
  // Focar no input
  document.getElementById("chatInput").focus()
}

// Função para fechar chat
function closeChat() {
  const modal = document.getElementById("chatModal")
  const overlay = document.getElementById("chatOverlay")
  
  modal.classList.remove("active")
  overlay.classList.remove("active")
  document.body.style.overflow = "auto"
}

// Função para adicionar mensagem ao chat
function addMessage(sender, message, senderName = "") {
  const messagesContainer = document.getElementById("chatMessages")
  const messageDiv = document.createElement("div")
  messageDiv.className = `message ${sender}-message`
  
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  const displayName = sender === "user" ? currentUser.name : senderName
  
  messageDiv.innerHTML = `
    <div class="message-avatar">${sender === "user" ? "👤" : "🏢"}</div>
    <div class="message-content">
      <div class="message-header">
        <span class="sender-name">${displayName}</span>
        <span class="message-time">${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <div class="message-text">${message}</div>
    </div>
  `
  
  messagesContainer.appendChild(messageDiv)
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

// Função para enviar mensagem
function sendMessage() {
  const input = document.getElementById("chatInput")
  const message = input.value.trim()
  
  if (message === "") return
  
  // Adicionar mensagem do usuário
  addMessage("user", message)
  
  // Limpar input
  input.value = ""
  
  // Simular resposta da ONG após um delay
  setTimeout(() => {
    const responses = [
      "Obrigado pela mensagem! Vou verificar essas informações para você.",
      "Que ótima pergunta! O processo de adoção é bem simples.",
      "Fico feliz em saber do seu interesse! Vamos agendar uma visita?",
      "Perfeito! Vou te enviar mais detalhes sobre o pet.",
      "Excelente! Você parece ser uma pessoa muito cuidadosa.",
      "Vou anotar essas informações. Tem mais alguma dúvida?"
    ]
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)]
    addMessage("ong", randomResponse, "ONG Amigos dos Animais")
  }, 1000 + Math.random() * 2000)
}

// Check if it's user's first time
function checkFirstTimeUser(user) {
  const hasSeenIntro = localStorage.getItem(`intro_seen_${user.id}`)

  if (!hasSeenIntro) {
    showIntroduction()
  }
}

// Show introduction modal
function showIntroduction() {
  const introModal = document.getElementById("introModal")
  const introOverlay = document.getElementById("introOverlay")

  introModal.classList.add("active")
  introOverlay.classList.add("active")

  // Disable body scroll
  document.body.style.overflow = "hidden"
}

// Hide introduction modal
function hideIntroduction() {
  const introModal = document.getElementById("introModal")
  const introOverlay = document.getElementById("introOverlay")

  introModal.classList.remove("active")
  introOverlay.classList.remove("active")

  // Re-enable body scroll
  document.body.style.overflow = "auto"

  // Mark as seen
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  localStorage.setItem(`intro_seen_${currentUser.id}`, "true")
}

// Setup introduction navigation
function setupIntroNavigation() {
  const prevBtn = document.getElementById("introPrev")
  const nextBtn = document.getElementById("introNext")
  const startBtn = document.getElementById("introStart")
  const dots = document.querySelectorAll(".intro-dot")
  const steps = document.querySelectorAll(".intro-step")

  let currentStep = 1
  const totalSteps = 4

  function updateStep(step) {
    // Hide all steps
    steps.forEach(s => s.classList.remove("active"))
    dots.forEach(d => d.classList.remove("active"))
    
    // Show current step
    document.querySelector(`[data-step="${step}"]`).classList.add("active")
    document.querySelector(`.intro-dot[data-step="${step}"]`).classList.add("active")
    
    // Update buttons
    prevBtn.disabled = step === 1
    
    if (step === totalSteps) {
      nextBtn.style.display = "none"
      startBtn.style.display = "block"
    } else {
      nextBtn.style.display = "block"
      startBtn.style.display = "none"
    }
    
    currentStep = step
  }

  // Previous button
  prevBtn.addEventListener("click", () => {
    if (currentStep > 1) {
      updateStep(currentStep - 1)
    }
  })

  // Next button
  nextBtn.addEventListener("click", () => {
    if (currentStep < totalSteps) {
      updateStep(currentStep + 1)
    }
  })

  // Start button
  startBtn.addEventListener("click", () => {
    hideIntroduction()
  })

  // Dots navigation
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const step = parseInt(dot.dataset.step)
      updateStep(step)
    })
  })

  // Close on overlay click
  document.getElementById("introOverlay").addEventListener("click", () => {
    hideIntroduction()
  })
}

// Setup event listeners
function setupEventListeners() {
  // Button clicks
  rejectBtn.addEventListener("click", () => handleAction("reject"))
  adoptBtn.addEventListener("click", () => handleAction("adopt"))

  // Help button
  document.getElementById("helpBtn").addEventListener("click", () => {
    showIntroduction()
  })

  // Card click para mostrar detalhes - APENAS se não houve drag
  mainCard.addEventListener("click", (e) => {
    // Não abrir se estiver arrastando, animando ou se houve movimento
    if (isDragging || isAnimating || hasMoved) return
    
    // Verificar se não clicou nos botões de ação
    if (e.target.closest('.action-btn')) return
    
    showPetDetails(dogs[currentIndex])
  })

  // Modal de detalhes - botões de fechar
  document.getElementById("closeDetailsBtn").addEventListener("click", hidePetDetails)
  document.getElementById("petDetailsOverlay").addEventListener("click", hidePetDetails)
  
  // Modal de detalhes - botões de ação
  document.getElementById("detailsRejectBtn").addEventListener("click", () => {
    hidePetDetails()
    setTimeout(() => handleAction("reject"), 300)
  })
  
  document.getElementById("detailsAdoptBtn").addEventListener("click", () => {
    hidePetDetails()
    setTimeout(() => handleAction("adopt"), 300)
  })

  // Setup introduction navigation
  setupIntroNavigation()

  // DEU PET modal - botões
  document.getElementById("openChatBtn").addEventListener("click", () => {
    hideDeuPetCelebration()
    setTimeout(() => {
      openChat(dogs[currentIndex])
    }, 300)
  })

  document.getElementById("continueBtn").addEventListener("click", () => {
    hideDeuPetCelebration()
    setTimeout(() => {
      continueToNextPet()
    }, 300)
  })

  // Chat modal - controles
  document.getElementById("closeChatBtn").addEventListener("click", closeChat)
  document.getElementById("chatOverlay").addEventListener("click", closeChat)

  document.getElementById("sendBtn").addEventListener("click", sendMessage)
  document.getElementById("chatInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      sendMessage()
    }
  })

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (isAnimating) return
    
    // Fechar modal com ESC
    if (e.key === "Escape") {
      hidePetDetails()
      return
    }

    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      handleAction("reject")
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      handleAction("adopt")
    } else if (e.key === " ") {
      e.preventDefault()
      handleAction("adopt")
    }
  })

  // Touch events for swipe
  mainCard.addEventListener("touchstart", handleTouchStart, { passive: false })
  mainCard.addEventListener("touchmove", handleTouchMove, { passive: false })
  mainCard.addEventListener("touchend", handleTouchEnd, { passive: false })

  // Mouse events for drag (desktop)
  mainCard.addEventListener("mousedown", handleMouseDown)
  document.addEventListener("mousemove", handleMouseMove)
  document.addEventListener("mouseup", handleMouseUp)
}

// Touch start
function handleTouchStart(e) {
  if (isAnimating) return

  startX = e.touches[0].clientX
  startY = e.touches[0].clientY
  isDragging = true
  hasMoved = false
}

// Touch move
function handleTouchMove(e) {
  if (!isDragging || isAnimating) return

  e.preventDefault()
  currentX = e.touches[0].clientX
  currentY = e.touches[0].clientY

  const diffX = currentX - startX
  const diffY = currentY - startY

  // Marcar que houve movimento se passou de um threshold mínimo
  if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
    hasMoved = true
  }

  // Only allow horizontal swipe if it's more significant than vertical
  if (Math.abs(diffX) > Math.abs(diffY)) {
    const rotation = diffX * 0.1
    const opacity = 1 - Math.abs(diffX) / 300

    mainCard.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`
    mainCard.style.opacity = opacity
  }
}

// Touch end
function handleTouchEnd(e) {
  if (!isDragging || isAnimating) return

  isDragging = false
  const diffX = currentX - startX

  // Reset transform
  mainCard.style.transform = ""
  mainCard.style.opacity = ""

  // Trigger action if swipe is significant enough
  if (Math.abs(diffX) > 100) {
    if (diffX > 0) {
      handleAction("adopt")
    } else {
      handleAction("reject")
    }
  }

  startX = 0
  startY = 0
  currentX = 0
  currentY = 0
  
  // Reset movimento após um pequeno delay para não interferir com clique
  setTimeout(() => {
    hasMoved = false
  }, 100)
}

// Mouse events (for desktop drag)
function handleMouseDown(e) {
  if (isAnimating) return

  startX = e.clientX
  startY = e.clientY
  isDragging = true
  hasMoved = false
  e.preventDefault()
}

function handleMouseMove(e) {
  if (!isDragging || isAnimating) return

  currentX = e.clientX
  currentY = e.clientY

  const diffX = currentX - startX
  const diffY = currentY - startY

  // Marcar que houve movimento se passou de um threshold mínimo
  if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
    hasMoved = true
  }

  if (Math.abs(diffX) > Math.abs(diffY)) {
    const rotation = diffX * 0.1
    const opacity = 1 - Math.abs(diffX) / 300

    mainCard.style.transform = `translateX(${diffX}px) rotate(${rotation}deg)`
    mainCard.style.opacity = opacity
  }
}

function handleMouseUp(e) {
  if (!isDragging || isAnimating) return

  isDragging = false
  const diffX = currentX - startX

  mainCard.style.transform = ""
  mainCard.style.opacity = ""

  if (Math.abs(diffX) > 100) {
    if (diffX > 0) {
      handleAction("adopt")
    } else {
      handleAction("reject")
    }
  }

  startX = 0
  startY = 0
  currentX = 0
  currentY = 0
  
  // Reset movimento após um pequeno delay para não interferir com clique
  setTimeout(() => {
    hasMoved = false
  }, 100)
}

// Start the app when DOM is loaded
document.addEventListener("DOMContentLoaded", init)

// Add some fun console messages
console.log("🐕 PetMatch carregado!")
console.log("💡 Dicas:")
console.log("   ← ou A = Rejeitar")
console.log("   → ou D = Adotar")
console.log("   Espaço = Adotar")
console.log("   Arraste o card para swipe!")
