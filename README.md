# TFG  
**CIBERSECURITY-CHATBOT**

A continuación se detallan los pasos para instalar el entorno de pruebas y utilizar la herramienta:

1. **Instalar Bun**  
   - **Windows**: Abre PowerShell y ejecuta:  
     ```bash
     powershell -c "irm bun.sh/install.ps1 | iex"
     ```
   - **Linux/macOS**: Abre la terminal y ejecuta:  
     ```bash
     curl -fsSL https://bun.sh/install | bash
     ```

2. **Instalar Hono**  
   Ejecuta en la terminal:  
   ```bash
   bun install hono
   ```

3. **Instalar Python y librerías necesarias para Web-Scrapper**  
   - Descarga Python desde [python.org](https://www.python.org/downloads/) e instala el PATH durante el proceso.  
   - Verifica la instalación con:  
     ```bash
     python --version
     ```
   - Instala las librerías necesarias:  
     ```bash
     pip install firecrawl pydantic python-dotenv
     ```

4. **Iniciar el servidor**  
   Ejecuta en la terminal:  
   ```bash
   bun run ./server.ts
   ```

5. **Acceder a la herramienta**  
   Abre en el navegador: [http://localhost:3000](http://localhost:3000)
