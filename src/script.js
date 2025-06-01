async function getTokens() {
    try {
        const response = await fetch('/api/tokens');
        if (!response.ok) {
            throw new Error(`Error al obtener tokens: ${response.statusText}`);
        }
        const tokens = await response.json();
        return tokens;
    } catch (error) {
        console.error("❌ Error al obtener los tokens:", error);
        return null;
    }
}

function setCookie(name, value, minutes) {
    const expires = new Date(Date.now() + minutes * 60 * 1000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/`;
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        if (match) {
    return match[2];
        } else {
    return null;
        }
}

function deleteCookie(name) {
    document.cookie = name + '=; Max-Age=0; path=/';
}

function scrollToTop()  {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function header() {
    fetch("./includes/cabecera.html") 
      .then((response) => response.text()) 
      .then((data) => {
        const headerContainer = document.getElementById("header") 
        if (headerContainer) {
          headerContainer.innerHTML = data   
          
          const username = getCookie("username")
          const usernameDisplay = document.getElementById("usernameDisplay")
          const logoutBtn = document.getElementById("logoutBtn")
          const adminBtn = document.getElementById("adminBtn")
  
          if (username && usernameDisplay && logoutBtn) {
            usernameDisplay.textContent = `Hola, ${username}`
            usernameDisplay.classList.remove("hidden")
            logoutBtn.classList.remove("hidden")
  
            logoutBtn.addEventListener("click", () => {
              deleteCookie("username")
              deleteCookie("role")
              deleteCookie("inicio_sesion")
              window.location.href = "/login.html"
            })
            if(getCookie('role')=='admin'){
                adminBtn.classList.remove("hidden")
                adminBtn.addEventListener("click", () => {
                    window.location.href = "/admin.html"
                })
            }
            const loginLink = document.getElementById("loginLink")
          if (getCookie("inicio_sesion") && loginLink) {
            loginLink.classList.add("hidden")
          }
          }
        } else {
          console.error('El elemento con id="header" no existe en el DOM.')
        }
      })
      .catch((error) => {
        console.error("Error al cargar la cabecera:", error) 
      })

}

function footer() {
    fetch('./includes/footer.html')  
        .then(response => response.text())  
        .then(data => {
            const footerContainer = document.getElementById('footer');  
            if (footerContainer) {
                footerContainer.innerHTML = data;  
            } else {
                console.error('El elemento con id="footer" no existe en el DOM.');
            }
        })
        .catch(error => {
            console.error('Error al cargar el pie:', error);  
        });
}

async function stackai() {
    const inputText = document.getElementById("consulta-api").value.trim();
    if(!getCookie('inicio_sesion')){
        alert("⚠️ Debes iniciar sesión para poder realizar consultas");
        return;
    }
    if (inputText === "") {
        alert("⚠️ Por favor, ingresa una consulta antes de continuar.");
        return;
    }
    let selectedActivity = document.querySelector(".dropdown-menu .dropdown-item-activity.active");
    if (!selectedActivity) { 
        alert("⚠️ Por favor, selecciona un tipo de actividad antes de generar la respuesta.");
        return;
    }
    let finalText=inputText;
    if (selectedActivity) {
        let activityText = '';
        switch (selectedActivity.id) {
            case "btn-vacio":
                activityText = "No me generes ninguna actividad, dame solo la información";
                break;
            case "btn-preguntas":
                activityText = "Generame una actividad con Preguntas abiertas";
                break;
            case "btn-test":
                activityText = "Generame una actividad con Preguntas tipo test";
                break;
            case "btn-completar":
                activityText = "Generame una actividad con Completar un código";
                break;
            default:
                break;
        }
    
        if (activityText) {
            finalText += `, ${activityText}`; 
        }
        finalText += '\n'; 
    }
    const answerDiv = document.getElementById("respuesta-api");
    answerDiv.innerHTML = `<img src="./img/cargando.gif" width="70" alt="Cargando..."> <br> ⏳ Cargando`;
    const tokens = await getTokens();
    if (!tokens) {
        console.error("No se pudieron obtener los tokens.");
        return;
    }

    try {
        const response = await fetch(
            "https://api.stack-ai.com/inference/v0/run/11ddb42a-48fd-4725-a344-f832a3e5ca29/67eac3de964c86c4aa5d9a02",
            {
                headers: {
                    'Authorization': `Bearer ${tokens.stack_token}`,
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({"user_id": "index_query", "in-0": finalText}),
            }
        );
        
        const result = await response.json();

        if (!result.outputs || !result.outputs["out-0"]) {
            throw new Error("Respuesta inesperada de la API");
        }

        let formattedText = result.outputs["out-0"]
            .replace(/\n/g, "<br>")  // Convertir saltos de línea a <br>
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")  // Convertir **texto** en negrita a <b>texto</b>
            .replace(/```([\s\S]*?)```/g, '<pre style="background-color: rgb(6, 5, 87); color: white; padding: 10px; border-radius: 5px; white-space: pre-wrap;">$1</pre>');  // Formatear código con fondo azul oscuro

        answerDiv.innerHTML = formattedText; 

    } catch (error) {
        answerDiv.innerHTML = `❌ Error: ${error.message}`;
    }
}

async function stackaiOpen() {
    const inputText = document.getElementById("consulta-api").value.trim();
    if(!getCookie('inicio_sesion')){
        alert("⚠️ Debes iniciar sesión para poder realizar consultas");
        return;
    }
    if (inputText === "") {
        alert("⚠️ Por favor, ingresa una consulta antes de continuar.");
        return;
    }
    let selectedActivity = document.querySelector(".dropdown-menu .dropdown-item-activity.active");
    if (!selectedActivity) { 
        alert("⚠️ Por favor, selecciona un tipo de actividad antes de generar la respuesta.");
        return;
    }
    let finalText=inputText;
    if (selectedActivity) {
        let activityText = '';
        switch (selectedActivity.id) {
            case "btn-vacio":
                activityText = "No me generes ninguna actividad, dame solo la información";
                break;
            case "btn-preguntas":
                activityText = "Generame una actividad con Preguntas abiertas";
                break;
            case "btn-test":
                activityText = "Generame una actividad con Preguntas tipo test";
                break;
            case "btn-completar":
                activityText = "Generame una actividad con Completar un código";
                break;
            default:
                break;
        }
    
        if (activityText) {
            finalText += `, ${activityText}`; 
        }
        finalText += '\n'; 
    }
    const answerDiv = document.getElementById("respuesta-api");
    answerDiv.innerHTML = `<img src="./img/cargando.gif" width="70" alt="Cargando..."> <br> ⏳ Cargando`;
    const tokens = await getTokens();
    if (!tokens) {
        console.error("No se pudieron obtener los tokens.");
        return;
    }

    try {
        const response = await fetch(
            "https://api.stack-ai.com/inference/v0/run/11ddb42a-48fd-4725-a344-f832a3e5ca29/683327cbee9ef9d9fae80536",
            {
                headers: {
                    'Authorization': `Bearer ${tokens.stack_token}`,
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({"user_id": "index_query", "in-0": finalText}),
            }
        );
        
        const result = await response.json();

        if (!result.outputs || !result.outputs["out-0"]) {
            throw new Error("Respuesta inesperada de la API");
        }

        let formattedText = result.outputs["out-0"]
            .replace(/\n/g, "<br>")  // Convertir saltos de línea a <br>
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")  // Convertir **texto** en negrita a <b>texto</b>
            .replace(/```([\s\S]*?)```/g, '<pre style="background-color: rgb(6, 5, 87); color: white; padding: 10px; border-radius: 5px; white-space: pre-wrap;">$1</pre>');  // Formatear código con fondo azul oscuro

        answerDiv.innerHTML = formattedText; 

    } catch (error) {
        answerDiv.innerHTML = `❌ Error: ${error.message}`;
    }
}

function Teacher_Word() {
    
    const answerDiv = document.getElementById("respuesta-api");
    const answerHTML = answerDiv.innerHTML.trim(); 

    if (answerHTML === "" || answerHTML.startsWith("⏳") || answerHTML.startsWith("❌")) {
        alert("No hay una respuesta válida para descargar.");
        return;
    }

    const docContent = `
        <html xmlns:w="urn:schemas-microsoft-com:office:word">
        <head><meta charset="UTF-8"></head>
        <body>
            <h1>GENERADOR DE ESCENARIOS DE APRENDIZAJE</h1>
            ${answerHTML} <!-- Se usa answerHTML para mantener el formato -->
        </body>
        </html>
    `;

    const blob = new Blob([docContent], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TFG_Stack_Profesor.doc"; 
    link.click(); 
}

function Student_Word() {
   
    const answerDiv = document.getElementById("respuesta-api");
    let answerHTML = answerDiv.innerHTML.trim(); 

    if (answerHTML === "" || answerHTML.startsWith("⏳") || answerHTML.startsWith("❌")) {
        alert("No hay una respuesta válida para descargar.");
        return;
    }

    const index = answerHTML.indexOf("Respuestas de la actividad:");
    if (index !== -1) {
        answerHTML = answerHTML.substring(0, index); 
    }

    
    const docContent = `
        <html xmlns:w="urn:schemas-microsoft-com:office:word">
        <head><meta charset="UTF-8"></head>
        <body>
            <h1>GENERADOR DE ESCENARIOS DE APRENDIZAJE</h1>
            ${answerHTML} <!-- Contenido sin la sección de respuestas -->
        </body>
        </html>
    `;

    
    const blob = new Blob([docContent], { type: 'application/msword' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "TFG_Stack_Alumno.doc"; 
    link.click(); 
}

function Teacher_PDF() {
    
    const answerDiv = document.getElementById("respuesta-api");
    const answerHTML = answerDiv.innerHTML.trim(); 

    if (answerHTML === "" || answerHTML.startsWith("⏳") || answerHTML.startsWith("❌")) {
        alert("No hay una respuesta válida para descargar.");
        return;
    }

    
    const PDFContainer = document.createElement("div");
    PDFContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 18px; font-weight: bold; color: #333;">GENERADOR DE ESCENARIOS DE APRENDIZAJE</h1>
        </div>
        <div style="font-size: 12px; line-height: 1.5; text-align: justify;">
            ${answerHTML}
        </div>
    `;
    document.body.appendChild(PDFContainer); 

   
    const opt = {
        margin:       10,
        filename:     'TFG_Stack_Profesor.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(PDFContainer).set(opt).save().then(() => {
        document.body.removeChild(PDFContainer);
    });
}

function Student_PDF() {
    const answerDiv = document.getElementById("respuesta-api");
    let answerHTML = answerDiv.innerHTML.trim(); 

    if (answerHTML === "" || answerHTML.startsWith("⏳") || answerHTML.startsWith("❌")) {
        alert("No hay una respuesta válida para descargar.");
        return;
    }

    const index = answerHTML.indexOf("Respuestas de la actividad:");
    if (index !== -1) {
        answerHTML = answerHTML.substring(0, index); 
    }
    
    const PDFContainer = document.createElement("div");
    PDFContainer.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="font-size: 18px; font-weight: bold; color: #333;">GENERADOR DE ESCENARIOS DE APRENDIZAJE</h1>
        </div>
        <div style="font-size: 12px; line-height: 1.5; text-align: justify;">
            ${answerHTML}
        </div>
    `;
    document.body.appendChild(PDFContainer); 

    const opt = {
        margin:       10,
        filename:     'TFG_Stack_Alumno.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(PDFContainer).set(opt).save().then(() => {
        document.body.removeChild(PDFContainer); 
    });
}

async function uploadFile() {
    if(!getCookie('inicio_sesion')){
        alert("⚠️ Debes iniciar sesión y estar verificado para poder subir archivos");
        return;
    }
    if(getCookie('role')=='usuario_no_verificado'){
        alert("⚠️ Debes estar verificado para subir archivos");
        document.getElementById("solicitud-popup").classList.remove("hidden");
        return;
    }
    
    const tokens = await getTokens();
    if (!tokens) {
        console.error("No se pudieron obtener los tokens.");
        return;
    }

    const personalAccessToken = tokens.bd_token;
    const repoOwner = 'elias-jr7'; 
    const repoName = 'BD-AUTOMATIZACI-N'; 
    const filePath = ''; 
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, selecciona un archivo.');
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async function () {
        const fileContent = reader.result.split(',')[1]; 

        try {
            const uploadResponse = await fetch(
                `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}${file.name}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `token ${personalAccessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message: 'Subiendo archivo desde formulario',
                        content: fileContent
                    })
                }
            );
        
            if (uploadResponse.status === 201) {
                alert('¡Archivo subido correctamente!');
            } else {
                alert('Hubo un error al subir el archivo.');
            }
        } catch (error) {
            console.error('Error al subir el archivo:', error);
            alert('Hubo un error al subir el archivo.');
        }
        
    };

    reader.readAsDataURL(file);
}


function showPopUpReport() {
    if(!getCookie('inicio_sesion')){
        alert("⚠️ Debes iniciar sesión para poder realizar consultas y enviar reportes");
        return;
    }
    if(getCookie('role')=='usuario_no_verificado'){
        alert("⚠️ Debes estar verificado para mandar un reporte");
        document.getElementById("solicitud-popup").classList.remove("hidden");
    }else{
        document.getElementById("reporte-popup").classList.remove("hidden");
    }
}

function showPopUpScanner() {
    if(!getCookie('inicio_sesion')){
        alert("⚠️ Debes iniciar sesión para poder realizar un scanner");
        return;
    }
    if(getCookie('role')=='usuario_no_verificado' || getCookie('role')=='usuario_verificado'){
        alert("⚠️ Debes ser gestor para hacer un scanner");
        document.getElementById("solicitud-gestor-popup").classList.remove("hidden");
    }else{
        window.location.href = "scanner.html"; 
    }
}

function closePopUpReport() {
    document.getElementById("reporte-popup").classList.add("hidden");
}

function closePopUpManagerRequest() {
    document.getElementById("solicitud-gestor-popup").classList.add("hidden");
}

function closePopUpRequest() {
    document.getElementById("solicitud-popup").classList.add("hidden");
}

async function sendRequest() {
    const message = document.getElementById("solicitud-texto").value.trim();
    const username = getCookie("username");
    const email = getCookie("email"); 
    const type = "verificacion";

    if (!message) {
      alert("⚠️ Añade un mensaje para poder enviar la solicitud.");
      return;
    }
  
    try {
      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, message, type })
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert("✅ Solicitud enviada con éxito. Espera la verificación de tu cuenta.");
        closePopUpRequest();
      } else {
        alert(result.error || "❌ Error al enviar la solicitud.");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
      alert("❌ Problema de conexión con el servidor.");
    }
}

async function sendRequestManager() {
    const message = document.getElementById("solicitud-gestor-texto").value.trim();
    const username = getCookie("username");
    const email = getCookie("email"); 
    const type = "contenido";
  
    if (!message) {
      alert("⚠️ Añade un mensaje para poder enviar la solicitud.");
      return;
    }
  
    try {
      const res = await fetch('/api/solicitud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, message, type})
      });
  
      const result = await res.json();
  
      if (res.ok) {
        alert("✅ Solicitud enviada con éxito. Espera la verificación de tu cuenta.");
        closePopUpManagerRequest();
      } else {
        alert(result.error || "❌ Error al enviar la solicitud.");
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
      alert("❌ Problema de conexión con el servidor.");
    }
  }
  
  async function generatePDFReport() {
    const tokens = await getTokens();
    if (!tokens) {
        console.error("No se pudieron obtener los tokens.");
        return;
    }

    const GITHUB_USERNAME = "camore12";  
    const REPO_NAME = "TFG_DB";    
    const GITHUB_TOKEN = tokens.reporte_token;

    if (!GITHUB_TOKEN) {
        console.error("❌ Falta GITHUB_TOKEN en el archivo .env");
        return;
    }

    const query = document.getElementById("consulta-api").value.trim();
    const answer = document.getElementById("respuesta-api").innerText.trim();
    const report = document.getElementById("reporte-texto").value.trim();

    if (!query || !answer || !report) {
        alert("⚠️ Asegúrate de llenar todos los campos antes de enviar el reporte.");
        return;
    }

    const username = getCookie('username');

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const formattedDate = `${day}_${month}_${year}`;
    const fullFileName = `reporte_${formattedDate}_${username}.pdf`;

    const contenidoPDF = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h1 style="text-align: center; font-size: 24px; color: #2c3e50; margin-bottom: 30px;">
                📄 Reporte Generador de Escenarios de Aprendizaje
            </h1><br>

            <h2 style="font-size: 18px; color: #2c3e50;">Nombre de Usuario:</h2>
            <p style="font-size: 14px; color: Black;">${username}</p><br>

            <h2 style="font-size: 18px; color: #2c3e50;">Consulta:</h2>
            <p style="font-size: 14px; color: Black;">${query}</p><br>

            <h2 style="font-size: 18px; color: #2c3e50;">Respuesta de la IA:</h2>
            <pre style="background: #ecf0f1; padding: 15px; border-radius: 8px; font-size: 13px; color: Black; white-space: pre-wrap;">${answer}</pre><br>

            <h2 style="font-size: 18px; color: #34495e;">📝 Reporte del Usuario:</h2>
            <p style="font-size: 14px; color: #2d3436;">${report}</p>
        </div>
    `;

    const PDFContainer = document.createElement("div");
    PDFContainer.innerHTML = contenidoPDF;

    const opt = {
        margin:       [10, 10, 10, 10],
        filename:     fullFileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    try {
        await html2pdf().from(PDFContainer).set(opt).save();

        const pdfBase64 = await html2pdf().from(PDFContainer).set(opt).toPdf().output('datauristring');
        const contenidoBase64 = pdfBase64.split(',')[1];

        const url = `https://api.github.com/repos/${GITHUB_USERNAME}/${REPO_NAME}/contents/${fullFileName}`;

        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Authorization": `token ${GITHUB_TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: `📌 Nuevo reporte generado: ${fullFileName}`,
                content: contenidoBase64
            })
        });

        if (response.ok) {
            alert("✅ Reporte PDF generado y subido correctamente a GitHub!");
        } else {
            alert("❌ Error al subir el reporte a GitHub.");
            console.error(await response.json());
        }
    } catch (error) {
        console.error("Error al generar y subir el PDF:", error);
        alert("❌ Hubo un problema con la generación o subida del PDF.");
    }

    document.getElementById("reporte-popup").classList.add("hidden");
}

async function acceptRequest(username, type) {
    try {
        const response = await fetch('/api/aceptar-solicitud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, type }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Error al aceptar la solicitud");
        }

        let rolAsigned = "";
        if(type=="contenido"){
            rolAsigned ="Gestor de Contenido"
        }
        else{
            rolAsigned ="Usuario Verificado"
        }
        alert(`✅ Solicitud aceptada: El usuario ${username} ahora tiene el rol de ${rolAsigned}.`);
    } catch (error) {
        alert(`❌ Error al aceptar la solicitud: ${error.message}`);
        console.error("Error al procesar la solicitud:", error);
    }
}

async function declineRequest(username) {
    try {
        const response = await fetch('/api/rechazar-solicitud', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        });

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Error al rechazar la solicitud");
        }

        alert(`❌ Solicitud de ${username} rechazada y eliminada correctamente.`);
    } catch (error) {
        alert(`❌ Error al rechazar la solicitud: ${error.message}`);
        console.error("Error al procesar la solicitud:", error);
    }
}


async function uploadRequests() {

    const requestTableBody = document.querySelector("#solicitudesTable tbody");

    requestTableBody.innerHTML = `
        <tr>
            <td colspan="4" class="text-center">Cargando solicitudes...</td>
        </tr>
    `;

    try {
    
        const response = await fetch('/api/solicitudes');
        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || "Error al cargar las solicitudes");
        }

        requestTableBody.innerHTML = "";

        result.data.forEach((solicitud) => {
            const row = document.createElement("tr");
            row.innerHTML = `
            <td class="px-4 py-2">${solicitud.username}</td>
            <td class="px-4 py-2">${solicitud.email}</td>
            <td class="px-4 py-2">${solicitud.mensaje}</td>
            <td class="px-4 py-2">${solicitud.type}</td>
            <td class="px-4 py-2 text-center">
                <!-- Contenedor con Flexbox -->
                <div class="flex justify-center items-center space-x-2"> <!-- Clases correctas para alineación horizontal -->
                    <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded aceptar-btn" data-username="${solicitud.username}" data-type="${solicitud.type}">
                        Aceptar
                    </button>
                    <button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded rechazar-btn" data-username="${solicitud.username}">
                        Rechazar
                    </button>
                </div>
            </td>
        `;
           
        
            requestTableBody.appendChild(row);
        });

        document.querySelectorAll(".aceptar-btn").forEach((btn) => {
            btn.addEventListener("click", async (event) => {
                const username = event.target.getAttribute("data-username");
                const type = event.target.getAttribute("data-type");
                if (username) {
                    await acceptRequest(username,type); 
                    uploadRequests(); 
                }
            });
        });
        
        document.querySelectorAll(".rechazar-btn").forEach((btn) => {
            btn.addEventListener("click", async (event) => {
                const username = event.target.getAttribute("data-username");
                if (username) {
                    await declineRequest(username);
                    uploadRequests(); 
                }
            });
        });
    } catch (error) {
        
        requestTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center text-danger">❌ Error: ${error.message}</td>
            </tr>
        `;
        console.error("Error al cargar las solicitudes:", error);
    }
}

async function runScanner() {
    const prompt2 = document.getElementById('prompt').value.trim();
    if (!prompt2) {
        alert("Por favor, introduce un prompt válido.");
        return;
    }
    
    const prompt = prompt2 + " Each item must include: a topic, a 250+ character description, and malware_codes as a list of relevant techniques or code examples if exists (including specific malware-related techniques, identifiers (e.g. MITRE ATT&CK IDs like T1486, T1059), or small code snippets (e.g. C++/shell)). Do not include single letters or nonsense.";
    
    const resultsContainer = document.getElementById('results');
    const statusContainer = document.getElementById('status');
    statusContainer.classList.remove('hidden');
    resultsContainer.innerHTML = "";

    try {
        const response = await fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt })
        });
        
        const data = await response.json();
        
        statusContainer.classList.add('hidden');
        
        if (data.success) {
            const files = data.files;
            if (files && files.length > 0) {
                resultsContainer.innerHTML = '<h3 class="text-xl font-semibold mb-3">Resultados del Escaneo</h3>';
        
                const table = document.createElement('table');
                table.className = 'table table-striped table-hover mb-4';
                const thead = document.createElement('thead');
                thead.innerHTML = `<tr><th>Archivo</th><th>Acción</th></tr>`;
                table.appendChild(thead);
        
                const tbody = document.createElement('tbody');
                const tokens = await getTokens();
                if (!tokens) {
                    console.error("No se pudieron obtener los tokens.");
                    return;
                }
        
                const personalAccessToken = tokens.bd_token;
                const repoOwner = 'elias-jr7';
                const repoName = 'BD-AUTOMATIZACI-N';
                const filePath = '';
        
                for (const file of files) {
                    const tr = document.createElement('tr');
        
                    const tdName = document.createElement('td');
                    tdName.textContent = file.name;
                    tr.appendChild(tdName);
        
                    const tdAction = document.createElement('td');
                    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = file.name;
                    link.className = 'btn btn-sm btn-outline-primary';
                    link.textContent = 'Descargar';
                    tdAction.appendChild(link);
                    tr.appendChild(tdAction);
        
                    tbody.appendChild(tr);
        
                    const fileContentBase64 = btoa(unescape(encodeURIComponent(file.content))); // Codificar el contenido a Base64
                    try {
                        const uploadResponse = await fetch(
                            `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}${file.name}`,
                            {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `token ${personalAccessToken}`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    message: `Subiendo archivo ${file.name} desde formulario`,
                                    content: fileContentBase64
                                })
                            }
                        );
        
                        if (!uploadResponse.ok) {
                            const errorData = await uploadResponse.json();
                            console.error(`Error al subir ${file.name}:`, errorData);
                        }
                    } catch (uploadError) {
                        console.error(`Error al subir ${file.name}:`, uploadError);
                    }
                }

                table.appendChild(tbody);
                resultsContainer.appendChild(table);

                const downloadAllBtn = document.createElement('button');
                downloadAllBtn.className = 'btn btn-success mt-3';
                downloadAllBtn.textContent = 'Descargar todos los resultados';
                downloadAllBtn.addEventListener('click', () => {
                    files.forEach(file => {
                        const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = file.name;
                        link.style.display = 'none';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    });
                });
                resultsContainer.appendChild(downloadAllBtn);

            } else {
                resultsContainer.innerHTML = "<p class='text-yellow-600'>No se encontraron resultados para este prompt.</p>";
            }
        } else {
            resultsContainer.innerHTML = `<p class='text-red-600'>Error: ${response.data.error || 'Error desconocido'}</p>`;
        }
    } catch (error) {
        statusContainer.classList.add('hidden');
        console.error(error);
        resultsContainer.innerHTML = "<p class='text-red-600'>Error al procesar el escáner. Intenta nuevamente.</p>";
        if (error.response?.data?.error) {
            resultsContainer.innerHTML += `<p class='text-sm text-red-500'>${error.response.data.error}</p>`;
        }
    }
}

async function getFileSha(path, token, username, repo) {

    const res = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
      headers: { Authorization: `token ${token}` }
    });
  
    if (!res.ok) throw new Error("No se pudo obtener el SHA del archivo.");
  
    const data = await res.json();
    return data.sha;
}

async function deleteFile(path, token, username, repo) {
    if (!confirm(`¿Estás seguro de eliminar el archivo "${path}"?`)) return;

    try {
        const sha = await getFileSha(path, token, username, repo);

        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/${path}`, {
            method: "DELETE",
            headers: {
                Authorization: `token ${token}`,
                Accept: "application/vnd.github.v3+json",
            },
            body: JSON.stringify({
                message: `Eliminando archivo ${path}`,
                sha: sha,
            }),
        });

        if (!response.ok) throw new Error("No se pudo eliminar el archivo.");

        alert(`Archivo eliminado: ${path}`);
        location.reload();

    } catch (err) {
        alert("Error al eliminar: " + err.message);
    }
}


async function fetchRepoContent() {
    const username = 'elias-jr7';
    const repo = 'BD-AUTOMATIZACI-N';

    const tokens = await getTokens();

    if (!tokens) {
        console.error("No se pudieron obtener los tokens.");
        return;
    }

    const token = tokens.bd_token;
    const repoBody = document.getElementById("repo-body");
    repoBody.innerHTML = ""; 
    try {
        const response = await fetch(`https://api.github.com/repos/${username}/${repo}/contents/?t=${Date.now()}`, {
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (!response.ok) throw new Error('No se pudo acceder al repositorio');

        const files = await response.json();

        for (const file of files) {
            const commitRes = await fetch(
                `https://api.github.com/repos/${username}/${repo}/commits?path=${file.path}&per_page=1`,
                {
                    headers: { Authorization: `token ${token}` }
                }
            );

            const commitData = await commitRes.json();
            const commit = commitData[0];

            const tr = document.createElement("tr");
            tr.className = "border-b hover:bg-gray-50";

            tr.innerHTML = `
            <td class="px-4 py-2">
                <a href="${file.html_url}" class="text-blue-600 hover:underline" target="_blank">
                    ${file.name}
                </a>
            </td>
            <td class="px-4 py-2">
                ${commit ? commit.commit.message : 'Sin descripción'}
            </td>
            <td class="px-4 py-2 text-right">
                ${commit ? new Date(commit.commit.author.date).toLocaleDateString() : '-'}
            </td>
            <td class="px-4 py-2 text-right">
                <button class="text-red-600 hover:underline">Eliminar</button>
            </td>
        `;
        
        const deleteButton = tr.querySelector("button");
        deleteButton.addEventListener("click", () => {
            deleteFile(file.path, token, username, repo);
        });
        

            repoBody.appendChild(tr);
        }

    } catch (err) {
        document.getElementById("repositorio").innerHTML = `
            <p class="text-red-500 p-4">Error: ${err.message}</p>
        `;
    }
}

header();
footer();

if (window.location.pathname === '/index.html'||window.location.pathname === '/aprendizaje.html') {
    document.querySelectorAll(".dropdown-item-activity").forEach(item => {
        item.addEventListener("click", function() {
            document.querySelectorAll(".dropdown-item-activity").forEach(el => el.classList.remove("active"));
            this.classList.add("active");
            document.getElementById("dropdownMenuButtonActivities").innerHTML = this.innerHTML;
        });
    });
}

if (window.location.pathname === '/admin.html') {
    uploadRequests();
}

const ContenidoRepositorio = document.getElementById('repositorio');
if(ContenidoRepositorio){
    fetchRepoContent();
}

const btnConsulta = document.getElementById("btn-consulta");
if (btnConsulta) {
  btnConsulta.addEventListener("click", stackai);
}

const btnConsultaOpen = document.getElementById("btn-consulta-open");
if (btnConsultaOpen) {
  btnConsultaOpen.addEventListener("click", stackaiOpen);
}

const btnProfesorWord = document.getElementById("btn-profesorword");
if (btnProfesorWord) {
  btnProfesorWord.addEventListener("click", Teacher_Word);
}

const btnProfesorPdf = document.getElementById("btn-profesorpdf");
if (btnProfesorPdf) {
  btnProfesorPdf.addEventListener("click", Teacher_PDF);
}

const btnAlumnoWord = document.getElementById("btn-alumnoword");
if (btnAlumnoWord) {
  btnAlumnoWord.addEventListener("click", Student_Word);
}

const btnAlumnoPdf = document.getElementById("btn-alumnopdf");
if (btnAlumnoPdf) {
  btnAlumnoPdf.addEventListener("click", Student_PDF);
}

const uploadBtn = document.getElementById("uploadButton");
if (uploadBtn) {
  uploadBtn.addEventListener("click", uploadFile);
}

const btnReporte = document.getElementById("btn-reporte");
if (btnReporte) {
  btnReporte.addEventListener("click", showPopUpReport);
}

const btnScanner = document.getElementById("btn-scanner");
if (btnScanner) {
    btnScanner.addEventListener("click", showPopUpScanner);
}

const btnCerrarReporte = document.getElementById("btn-cerrar-reporte");
if (btnCerrarReporte) {
  btnCerrarReporte.addEventListener("click", closePopUpReport);
}

const btnCerrarSolicitudGestor = document.getElementById("btn-cerrar-solicitud-gestor");
if (btnCerrarSolicitudGestor) {
    btnCerrarSolicitudGestor.addEventListener("click", closePopUpManagerRequest);
}

const btnCerrarSolicitud = document.getElementById("btn-cerrar-solicitud");
if (btnCerrarSolicitud) {
  btnCerrarSolicitud.addEventListener("click", closePopUpRequest);
}

const btnsendRequest = document.getElementById("btn-enviar-solicitud");
if (btnsendRequest) {
  btnsendRequest.addEventListener("click", sendRequest);
}

const btnsendRequestManager = document.getElementById("btn-enviar-solicitud-gestor");
if (btnsendRequestManager) {
  btnsendRequestManager.addEventListener("click", sendRequestManager);
}


const btnEnviarReporte = document.getElementById("btn-enviar-reporte");
if (btnEnviarReporte) {
  btnEnviarReporte.addEventListener("click", generatePDFReport);  
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
          setCookie('username', data.user.username, 30);
          setCookie('role', data.user.role, 30);
          setCookie('inicio_sesion', true, 30);
          setCookie('email', data.user.email, 30);
          window.location.href = '/index.html';
        } else {
          alert(data.error || 'Error al iniciar sesión');
        }
      } catch (err) {
        console.error(err);
        alert('Error de conexión con el servidor');
      }
    });
}

const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const result = await response.json();

      
      if (response.ok) {
        setCookie('username', result.user.username, 30);
          setCookie('role', result.user.role, 30);
          setCookie('inicio_sesion', true, 30);
          setCookie('email', result.user.email, 30);
          window.location.href = '/index.html';
      } else {
        alert(result.error || 'Error al registrarse');
      }
    } catch (error) {
        console.error(error);
        alert('Error de conexión con el servidor');
    }
  });
}

const runScraperBtn = document.getElementById("runScraperBtn");
if (runScraperBtn) {
    runScraperBtn.addEventListener("click", runScanner);
}

const repoLink = document.getElementById("repositorioLink");
if(repoLink){
    const role = getCookie("role");
    if (role !== "admin" && role !== "gestor_contenido") {
        repoLink.addEventListener("click", (e) => {
            e.preventDefault();
            alert("Debes ser admin o gestor de contenido para poder acceder al repositorio.");
        });
        
    }
    
}
