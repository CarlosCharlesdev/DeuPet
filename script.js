// Dog data
const dogs = [
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
  },
  {
    id: 3,
    name: "Bella",
    age: "1 ano",
    breed: "Border Collie",
    location: "Belo Horizonte, MG",
    image: "/placeholder.svg?height=400&width=400&text=Bella+Border+Collie",
    characteristics: ["Esperta", "Ativa", "Carinhosa"],
    bio: "Sou a Bella e sou super esperta! Aprendo truques rapidinho e adoro brincar de buscar a bolinha. Preciso de uma família ativa!",
    size: "Médio",
  },
  {
    id: 4,
    name: "Thor",
    age: "3 anos",
    breed: "Pastor Alemão",
    location: "Curitiba, PR",
    image: "/placeholder.svg?height=400&width=400&text=Thor+Pastor+Alemão",
    characteristics: ["Protetor", "Corajoso", "Leal"],
    bio: "Eu sou o Thor! Sou um guardião nato, mas também muito carinhoso com quem amo. Procuro uma família que me dê muito amor e atenção.",
    size: "Grande",
  },
  {
    id: 5,
    name: "Mia",
    age: "6 meses",
    breed: "Poodle",
    location: "Porto Alegre, RS",
    image: "/placeholder.svg?height=400&width=400&text=Mia+Poodle",
    characteristics: ["Fofa", "Brincalhona", "Pequena"],
    bio: "Oi, eu sou a Mia! Sou pequenininha mas cheia de energia. Adoro brincar e fazer travessuras. Quem quer me mimar muito?",
    size: "Pequeno",
  },
  {
    id: 6,
    name: "Rex",
    age: "5 anos",
    breed: "Rottweiler",
    location: "Brasília, DF",
    image: "/placeholder.svg?height=400&width=400&text=Rex+Rottweiler",
    characteristics: ["Forte", "Protetor", "Carinhoso"],
    bio: "Sou o Rex! Posso parecer intimidador, mas sou um gigante gentil. Adoro crianças e sou muito protetor da minha família.",
    size: "Grande",
  },
  {
    id: 7,
    name: "Nina",
    age: "3 anos",
    breed: "Beagle",
    location: "Salvador, BA",
    image: "/placeholder.svg?height=400&width=400&text=Nina+Beagle",
    characteristics: ["Curiosa", "Amigável", "Aventureira"],
    bio: "Eu sou a Nina! Adoro explorar e farejar tudo. Sou muito sociável e me dou bem com outros pets. Vamos ser amigos?",
    size: "Médio",
  },
  {
    id: 8,
    name: "Buddy",
    age: "7 anos",
    breed: "Vira-lata",
    location: "Recife, PE",
    image: "/placeholder.svg?height=400&width=400&text=Buddy+Vira-lata",
    characteristics: ["Sábio", "Calmo", "Leal"],
    bio: "Sou o Buddy, um senhor experiente! Já passei por muita coisa na vida e agora só quero um lar tranquilo para descansar e dar muito amor.",
    size: "Médio",
  },
]

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

// Initialize app
function init() {
  createProgressDots()
  displayCurrentDog()
  setupEventListeners()
  loadStats()
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

// Display current dog
function displayCurrentDog() {
  const dog = dogs[currentIndex]

  // Add loading class
  mainCard.classList.add("loading")

  dogImage.src = dog.image
  dogImage.alt = dog.name
  dogName.textContent = dog.name
  dogAge.textContent = dog.age
  dogBreed.textContent = dog.breed
  dogLocation.textContent = dog.location
  dogBio.textContent = dog.bio
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
}

// Update progress dots
function updateProgressDots() {
  const dots = progressContainer.querySelectorAll(".progress-dot")
  dots.forEach((dot, index) => {
    dot.classList.toggle("active", index === currentIndex)
  })
}

// Handle action (adopt or reject)
function handleAction(action) {
  if (isAnimating) return

  isAnimating = true

  // Update stats
  if (action === "adopt") {
    adoptedCount++
    mainCard.classList.add("swipe-right")
  } else {
    rejectedCount++
    mainCard.classList.add("swipe-left")
  }

  saveStats()
  updateStats()

  // Disable buttons
  rejectBtn.disabled = true
  adoptBtn.disabled = true

  // Log action
  console.log(`${action === "adopt" ? "❤️ Adotado" : "❌ Rejeitado"}: ${dogs[currentIndex].name}`)

  setTimeout(() => {
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
  }, 400)
}

// Setup event listeners
function setupEventListeners() {
  // Button clicks
  rejectBtn.addEventListener("click", () => handleAction("reject"))
  adoptBtn.addEventListener("click", () => handleAction("adopt"))

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (isAnimating) return

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
}

// Touch move
function handleTouchMove(e) {
  if (!isDragging || isAnimating) return

  e.preventDefault()
  currentX = e.touches[0].clientX
  currentY = e.touches[0].clientY

  const diffX = currentX - startX
  const diffY = currentY - startY

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
}

// Mouse events (for desktop drag)
function handleMouseDown(e) {
  if (isAnimating) return

  startX = e.clientX
  startY = e.clientY
  isDragging = true
  e.preventDefault()
}

function handleMouseMove(e) {
  if (!isDragging || isAnimating) return

  currentX = e.clientX
  currentY = e.clientY

  const diffX = currentX - startX
  const diffY = currentY - startY

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
