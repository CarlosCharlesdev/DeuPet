const http = require("http")
const fs = require("fs")
const path = require("path")
const url = require("url")

const PORT = process.env.PORT || 3000

// Simple in-memory database (in production, use a real database)
const users = [
  {
    id: 1,
    email: "cliente@petmatch.com",
    password: "123456",
    name: "Cliente Teste",
    type: "client",
    phone: "(11) 99999-9999",
    city: "São Paulo, SP",
  },
  {
    id: 2,
    email: "ong@petmatch.com",
    password: "123456",
    name: "ONG Amigos dos Animais",
    type: "ong",
    phone: "(11) 88888-8888",
    city: "São Paulo, SP",
  },
]

const animals = [
  {
    id: 1,
    name: "Luna",
    age: "2 anos",
    breed: "Golden Retriever",
    location: "São Paulo, SP",
    image: "/imagAnimais/Goldensondika.jpg",
    characteristics: ["Carinhosa", "Brincalhona", "Obediente"],
    bio: "Oi! Sou a Luna e adoro brincar no parque. Sou muito carinhosa e amo fazer novos amigos. Procuro uma família que goste de aventuras!",
    size: "Grande",
    type: "dog",
    ongId: 2,
  },
  {
    id: 2,
    name: "Max",
    age: "4 anos",
    breed: "Labrador",
    location: "Rio de Janeiro, RJ",
    image: "/imagAnimais/labrador-tudo-sobre-a-raca.jpg",
    characteristics: ["Leal", "Energético", "Inteligente"],
    bio: "Eu sou o Max! Adoro nadar e correr na praia. Sou muito leal e protetor da minha família. Que tal me dar uma chance?",
    size: "Grande",
    type: "dog",
    ongId: 2,
  },
  {
    id: 3,
    name: "Mimi",
    age: "1 ano",
    breed: "Siamês",
    location: "São Paulo, SP",
    image: "/imagAnimais/gato-siames.jpg",
    characteristics: ["Carinhosa", "Independente", "Brincalhona"],
    bio: "Oi! Sou a Mimi e adoro brincar com bolinhas. Sou muito carinhosa mas também gosto da minha independência. Procuro uma família que me entenda!",
    size: "Pequeno",
    type: "cat",
    ongId: 2,
  },
]

const actions = []
let nextUserId = 3
let nextAnimalId = 4

// MIME types
const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
}

// Create server
const server = http.createServer(async (req, res) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} - ${req.method} ${req.url}`)

  const parsedUrl = url.parse(req.url, true)
  const pathname = parsedUrl.pathname

  // Handle API routes
  if (pathname.startsWith("/api/")) {
    await handleApiRequest(req, res, pathname)
    return
  }

  let filePath = "." + pathname

  // Default to index.html
  if (filePath === "./") {
    filePath = "./welcome.html"
  }

  // Handle placeholder.svg requests
  if (pathname.startsWith("/placeholder.svg")) {
    const width = parsedUrl.query.width || "400"
    const height = parsedUrl.query.height || "400"
    const text = parsedUrl.query.text || "Cachorro"

    const svg = generatePlaceholderSVG(width, height, text)

    res.writeHead(200, {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=3600",
    })
    res.end(svg)
    return
  }

  const extname = String(path.extname(filePath)).toLowerCase()
  const contentType = mimeTypes[extname] || "application/octet-stream"

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === "ENOENT") {
        // File not found
        res.writeHead(404, { "Content-Type": "text/html" })
        res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>404 - Não encontrado</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px;
                  background: linear-gradient(135deg, #fdf2f8 0%, #fed7aa 100%);
                }
                .container {
                  background: white;
                  padding: 2rem;
                  border-radius: 16px;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                  max-width: 500px;
                  margin: 0 auto;
                }
                h1 { color: #1f2937; }
                p { color: #6b7280; }
                a { 
                  color: #ec4899; 
                  text-decoration: none;
                  font-weight: bold;
                }
                a:hover { text-decoration: underline; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🐕 404 - Página não encontrada</h1>
                <p>O arquivo <code>${pathname}</code> não foi encontrado.</p>
                <p><a href="/">← Voltar ao PetMatch</a></p>
              </div>
            </body>
          </html>
        `)
      } else {
        // Server error
        res.writeHead(500, { "Content-Type": "text/html" })
        res.end(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>500 - Erro do servidor</title>
              <style>
                body { 
                  font-family: Arial, sans-serif; 
                  text-align: center; 
                  padding: 50px;
                  background: linear-gradient(135deg, #fdf2f8 0%, #fed7aa 100%);
                }
              </style>
            </head>
            <body>
              <h1>🚨 Erro do servidor</h1>
              <p>Código do erro: ${error.code}</p>
              <p><a href="/">← Voltar ao PetMatch</a></p>
            </body>
          </html>
        `)
      }
    } else {
      // Success
      const headers = {
        "Content-Type": contentType,
      }

      // Add cache headers for static assets
      if (extname === ".css" || extname === ".js") {
        headers["Cache-Control"] = "public, max-age=3600"
      }

      res.writeHead(200, headers)
      res.end(content, "utf-8")
    }
  })
})

// Handle API requests
async function handleApiRequest(req, res, pathname) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    res.writeHead(200)
    res.end()
    return
  }

  try {
    let body = ""
    if (req.method === "POST" || req.method === "PUT") {
      body = await getRequestBody(req)
    }

    let response = { success: false, message: "Route not found" }

    switch (pathname) {
      case "/api/login":
        response = handleLogin(JSON.parse(body))
        break
      case "/api/register":
        response = handleRegister(JSON.parse(body))
        break
      case "/api/animals":
        if (req.method === "GET") {
          response = handleGetAnimals()
        } else if (req.method === "POST") {
          response = handleAddAnimal(JSON.parse(body))
        }
        break
      case "/api/stats":
        response = handleGetStats()
        break
      case "/api/actions":
        if (req.method === "POST") {
          response = handleAddAction(JSON.parse(body))
        }
        break
      default:
        if (pathname.startsWith("/api/animals/") && req.method === "DELETE") {
          const animalId = Number.parseInt(pathname.split("/")[3])
          response = handleDeleteAnimal(animalId)
        }
        break
    }

    res.writeHead(200, { "Content-Type": "application/json" })
    res.end(JSON.stringify(response))
  } catch (error) {
    console.error("API Error:", error)
    res.writeHead(500, { "Content-Type": "application/json" })
    res.end(JSON.stringify({ success: false, message: "Internal server error" }))
  }
}

// Get request body
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = ""
    req.on("data", (chunk) => {
      body += chunk.toString()
    })
    req.on("end", () => {
      resolve(body)
    })
    req.on("error", reject)
  })
}

// API handlers
function handleLogin(data) {
  const { email, password } = data

  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    const { password: _, ...userWithoutPassword } = user
    return {
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    }
  } else {
    return {
      success: false,
      message: "Email ou senha incorretos",
    }
  }
}

function handleRegister(data) {
  const { name, email, phone, city, password } = data

  // Check if user already exists
  if (users.find((u) => u.email === email)) {
    return {
      success: false,
      message: "Email já cadastrado",
    }
  }

  // Create new user
  const newUser = {
    id: nextUserId++,
    email,
    password,
    name,
    phone,
    city,
    type: "client",
  }

  users.push(newUser)

  const { password: _, ...userWithoutPassword } = newUser
  return {
    success: true,
    message: "User registered successfully",
    user: userWithoutPassword,
  }
}

function handleGetAnimals() {
  return {
    success: true,
    animals: animals,
  }
}

function handleAddAnimal(data) {
  const newAnimal = {
    id: nextAnimalId++,
    ...data,
    createdAt: new Date().toISOString(),
  }

  animals.push(newAnimal)

  return {
    success: true,
    message: "Animal added successfully",
    animal: newAnimal,
  }
}

function handleDeleteAnimal(animalId) {
  const index = animals.findIndex((a) => a.id === animalId)

  if (index === -1) {
    return {
      success: false,
      message: "Animal not found",
    }
  }

  animals.splice(index, 1)

  return {
    success: true,
    message: "Animal deleted successfully",
  }
}

function handleGetStats() {
  const dogs = animals.filter((a) => a.type === "dog").length
  const cats = animals.filter((a) => a.type === "cat").length
  const adopted = actions.filter((a) => a.action === "adopt").length
  const interested = actions.length

  return {
    success: true,
    data: {
      dogs,
      cats,
      adopted,
      interested,
    },
  }
}

function handleAddAction(data) {
  const newAction = {
    id: actions.length + 1,
    ...data,
    timestamp: new Date().toISOString(),
  }

  actions.push(newAction)

  return {
    success: true,
    message: "Action logged successfully",
  }
}

// Generate placeholder SVG with dog themes
function generatePlaceholderSVG(width, height, text) {
  const dogColors = [
    "#8B4513", // Marrom
    "#D2691E", // Chocolate
    "#F4A460", // Sandy Brown
    "#DEB887", // Burlywood
    "#D3D3D3", // Light Gray
    "#000000", // Preto
    "#FFFFFF", // Branco
    "#FFD700", // Dourado
    "#CD853F", // Peru
    "#A0522D", // Sienna
  ]

  const bgColor = dogColors[Math.floor(Math.random() * dogColors.length)]
  const textColor = bgColor === "#FFFFFF" || bgColor === "#D3D3D3" ? "#333333" : "#FFFFFF"

  // Decode the text parameter
  const decodedText = decodeURIComponent(text.replace(/\+/g, " "))

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${adjustBrightness(bgColor, -20)};stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <circle cx="50%" cy="40%" r="60" fill="${adjustBrightness(bgColor, 30)}" opacity="0.3"/>
      <text x="50%" y="30%" font-family="Arial, sans-serif" font-size="48" 
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
        🐕
      </text>
      <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="14" font-weight="bold"
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle">
        ${decodedText}
      </text>
      <text x="50%" y="75%" font-family="Arial, sans-serif" font-size="12" 
            fill="${textColor}" text-anchor="middle" dominant-baseline="middle" opacity="0.8">
        ${width}x${height}
      </text>
    </svg>
  `
}

// Helper function to adjust color brightness
function adjustBrightness(color, amount) {
  const usePound = color[0] === "#"
  const col = usePound ? color.slice(1) : color

  if (col.length === 3) {
    // Convert 3-digit hex to 6-digit
    const expandedCol = col
      .split("")
      .map((c) => c + c)
      .join("")
    return adjustBrightness("#" + expandedCol, amount)
  }

  const num = Number.parseInt(col, 16)
  let r = (num >> 16) + amount
  let g = ((num >> 8) & 0x00ff) + amount
  let b = (num & 0x0000ff) + amount

  r = r > 255 ? 255 : r < 0 ? 0 : r
  g = g > 255 ? 255 : g < 0 ? 0 : g
  b = b > 255 ? 255 : b < 0 ? 0 : b

  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")
}

// Start server
server.listen(PORT, () => {
  console.log("🐕 ================================")
  console.log("🐕 PetMatch Server iniciado!")
  console.log(`🐕 Acesse: http://localhost:${PORT}`)
  console.log("🐕 ================================")
  console.log("🔐 Credenciais de teste:")
  console.log("   Cliente: cliente@petmatch.com / 123456")
  console.log("   ONG: ong@petmatch.com / 123456")
  console.log("🐕 ================================")
  console.log("🛑 Pressione Ctrl+C para parar")
})

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Parando o servidor...")
  server.close(() => {
    console.log("✅ Servidor parado com sucesso!")
    console.log("🐕 Obrigado por usar o PetMatch!")
    process.exit(0)
  })
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("❌ Erro não capturado:", err)
  process.exit(1)
})

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Promise rejeitada:", reason)
  process.exit(1)
})
