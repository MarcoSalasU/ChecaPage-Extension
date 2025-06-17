// 🔵 ANALIZAR POR URL
document.getElementById("analizarBtn").addEventListener("click", () => {
  const url = document.getElementById("urlInput").value.trim();
  const resultadoBox = document.getElementById("resultado");
  let penalizacion = 0;

  if (!url || !url.startsWith("http")) {
    resultadoBox.style.display = "block";
    resultadoBox.textContent = "⚠️ Ingresa una URL válida antes de analizar la URL";
    resultadoBox.className = "status-box status-red";
    return;
  }

  // 🛑 Penaliza si empieza con http
  if (url.startsWith("http://")) {
    penalizacion += 0.10;
  }

  resultadoBox.style.display = "block";
  resultadoBox.textContent = "Analizando URL...";
  resultadoBox.className = "status-box status-default";

  const features = extractFeatures(url);

  fetch("https://checapage-backend.onrender.com/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features: features })
  })
    .then(res => res.json())
    .then(data => {
      let prob = data.probabilidad || 0;
      prob = Math.min(prob + penalizacion, 1); // No pasarse del 100%
      const porcentaje = Math.round(prob * 1000) / 10;

      let label = "";
      let clase = "";

      if (porcentaje <= 35) {
        label = "🟢 <strong>Seguro</strong>";
        clase = "status-box status-green";
      } else if (porcentaje <= 50) {
        label = "🟡 <strong>Sospechoso</strong>";
        clase = "status-box status-yellow";
      } else {
        label = "🔴 <strong>Peligroso</strong>";
        clase = "status-box status-red";
      }

      resultadoBox.innerHTML = `${label}<br>Probabilidad: ${porcentaje}%`;
      resultadoBox.className = clase;
    })
    .catch(err => {
      console.error("Error:", err);
      resultadoBox.style.display = "block";
      resultadoBox.textContent = "Error al conectar con el API.";
      resultadoBox.className = "status-box status-red";
    });
});


// 🟠 ANALIZAR POR CONTENIDO (HTML + IMAGEN BASE64)
document.getElementById("analizarContenidoBtn").addEventListener("click", () => {
  const url = document.getElementById("urlInput").value.trim();
  const resultadoBox = document.getElementById("resultado");

  if (!url || !url.startsWith("http")) {
    resultadoBox.style.display = "block";
    resultadoBox.textContent = "⚠️ Ingresa una URL válida antes de analizar el contenido.";
    resultadoBox.className = "status-box status-red";
    return;
  }

  resultadoBox.style.display = "block";
  resultadoBox.textContent = "Analizando contenido...";
  resultadoBox.className = "status-box status-default";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];

    // ✅ Si ya estamos en la URL deseada
    if (activeTab.url.replace(/\/+$/, '') === url.replace(/\/+$/, '')) {
      chrome.tabs.sendMessage(
        activeTab.id,
        { tipo: "capturar_html_y_img_y_iframes" },
        (response) => {
          const html = response.html || "";

          console.log("📄 HTML recibido: " + html.length + " caracteres");
          console.log("🔢 Estructura HTML:");
          console.log("   - <script>: ", (html.match(/<script/gi) || []).length);
          console.log("   - <iframe>: ", (html.match(/<iframe/gi) || []).length);
          console.log("   - <form>: ", (html.match(/<form/gi) || []).length);
          console.log("   - <input>: ", (html.match(/<input/gi) || []).length);

          console.log("🧾 Fragmento inicial del HTML:");
          console.log(html.slice(0, 600)); // 🔎 muestra más que antes

          if (response.iframes > 0) {
            console.log("🧱 Iframes detectados:", response.iframes);
          }

          const imgSizeKB = Math.round((response.img?.length || 0) / 1024);
          console.log("📷 Imagen base64 (~" + imgSizeKB + " KB)");

          manejarRespuestaContenido(response, resultadoBox);
        }
      );
    } else {
      // 🔁 Si no estamos en la URL, la abrimos
      chrome.tabs.create({ url: url, active: true }, (newTab) => {
        setTimeout(() => {
          chrome.tabs.sendMessage(
            newTab.id,
            { tipo: "capturar_html_y_img_y_iframes" },
            (response) => {
              const html = response.html || "";

              console.log("📄 HTML recibido: " + html.length + " caracteres");
              console.log("🔢 Estructura HTML:");
              console.log("   - <script>: ", (html.match(/<script/gi) || []).length);
              console.log("   - <iframe>: ", (html.match(/<iframe/gi) || []).length);
              console.log("   - <form>: ", (html.match(/<form/gi) || []).length);
              console.log("   - <input>: ", (html.match(/<input/gi) || []).length);

              console.log("🧾 Fragmento inicial del HTML:");
              console.log(html.slice(0, 600)); // 🔎 muestra más que antes

              if (response.iframes > 0) {
                console.log("🧱 Iframes detectados:", response.iframes);
              }

              const imgSizeKB = Math.round((response.img?.length || 0) / 1024);
              console.log("📷 Imagen base64 (~" + imgSizeKB + " KB)");

              manejarRespuestaContenido(response, resultadoBox);
            }
          );
        }, 4000); // espera para que cargue la página
      });
    }
  });
});

// 🔧 Manejo centralizado de respuesta
function manejarRespuestaContenido(response, resultadoBox) {
  if (chrome.runtime.lastError || !response) {
    resultadoBox.textContent = "⚠️ No se pudo obtener contenido.";
    resultadoBox.className = "status-box status-red";
    return;
  }

  if (!response.html || !response.img) {
    resultadoBox.textContent = "⚠️ Respuesta incompleta.";
    resultadoBox.className = "status-box status-red";
    return;
  }

  if (response.iframes > 0) {
    const alertaIframe = document.getElementById("alertaIframe");
    alertaIframe.style.display = "block";
    alertaIframe.innerHTML = `${response.iframes} iframes detectados, posible contenido externo.`;
  } else {
    document.getElementById("alertaIframe").style.display = "none";
  }

  const imagenBase64Limpia = response.img.replace(/^data:image\/(png|jpeg);base64,/, "");

  fetch("https://backend-checapage-2.onrender.com/analyze_content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      html: response.html,
      img: imagenBase64Limpia,
    }),
  })
    .then(res => res.json())
    .then(data => {
      console.log("📩 Respuesta del backend:", data);

      const prob = data.probabilidad || 0;
      const porcentaje = Math.round(prob * 1000) / 10;

      if (response.iframes > 0) {
        console.log("🧱 Iframes detectados:", response.iframes);
      }

      let label = "";
      let clase = "";

      if (porcentaje <= 35) {
        label = "🟢 <strong>Seguro</strong>";
        clase = "status-box status-green";
      } else if (porcentaje <= 50) {
        label = "🟡 <strong>Sospechoso</strong>";
        clase = "status-box status-yellow";
      } else {
        label = "🔴 <strong>Peligroso</strong>";
        clase = "status-box status-red";
      }

      resultadoBox.innerHTML = `${label}<br>Probabilidad: ${porcentaje}%`;
      resultadoBox.className = clase;
    })
    .catch(err => {
      console.error("❌ Error al analizar:", err);
      resultadoBox.textContent = "❌ Error al conectar con el backend.";
      resultadoBox.className = "status-box status-red";
    });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.tipo === "hay_iframe") {
    const alertaIframe = document.getElementById("alertaIframe");
    alertaIframe.style.display = "block";
    alertaIframe.innerHTML = `${message.cantidad} iframes detectados, posible contenido externo.`;
  }
});