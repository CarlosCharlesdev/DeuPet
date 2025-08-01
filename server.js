const http = require("http")
const fs = require("fs")
const path = require("path")

const PORT = process.env.PORT || 3000

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
const server = http.createServer((req, res) => {
  const timestamp = new Date().toISOString()
  console.log(`${timestamp} - ${req.method} ${req.url}`)

  let filePath = "." + req.url

  // Default to index.html
  if (filePath === "./") {
    filePath = "./index.html"
  }

  // Handle placeholder.svg requests
  if (req.url.startsWith("/placeholder.svg")) {
    const url = new URL(req.url, `http://localhost:${PORT}`)
    const width = url.searchParams.get("width") || "400"
    const height = url.searchParams.get("height") || "400"
    const text = url.searchParams.get("text") || "Cachorro"

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
                <p>O arquivo <code>${req.url}</code> não foi encontrado.</p>
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
  console.log("🎮 Controles:")
  console.log("   ← ou A = Rejeitar")
  console.log("   → ou D = Adotar")
  console.log("   Espaço = Adotar")
  console.log("   Arraste = Swipe")
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
