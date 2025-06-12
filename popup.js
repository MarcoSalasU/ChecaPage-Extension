// 🔵 ANALIZAR POR URL
document.getElementById("analizarBtn").addEventListener("click", () => {
  const url = document.getElementById("urlInput").value;
  const resultadoBox = document.getElementById("resultado");

  if (!url || !url.startsWith("http")) {
    resultadoBox.textContent = "⚠️ Ingresa una URL válida (http/https)";
    resultadoBox.className = "status-box status-red";
    return;
  }

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
      const prob = data.probabilidad || 0;
      let color = "status-green";
      let label = "🟢 Seguro";

      if (prob >= 0.5) {
        color = "status-red";
        label = "🔴 Peligroso";
      } else if (prob >= 0.14) {
        color = "status-yellow";
        label = "🟡 Sospechoso";
      }

      resultadoBox.innerHTML = `<strong>${label}</strong><br>Probabilidad: ${Math.round(prob * 100)}%`;
      resultadoBox.className = "status-box " + color;
    })
    .catch(err => {
      console.error("Error:", err);
      resultadoBox.textContent = "Error al conectar con el API.";
      resultadoBox.className = "status-box status-red";
    });
});


// 🟠 ANALIZAR POR CONTENIDO (HTML + IMAGEN BASE64)
document.getElementById("analizarContenidoBtn").addEventListener("click", () => {
  const resultadoBox = document.getElementById("resultado");
  resultadoBox.textContent = "Capturando contenido de la página...";
  resultadoBox.className = "status-box status-default";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { tipo: "capturar_html_y_img" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error("❌ Error al conectar con content_script:", chrome.runtime.lastError.message);
        resultadoBox.textContent = "⚠️ No se pudo obtener contenido.";
        resultadoBox.className = "status-box status-red";
        return;
      }

      console.log("📩 Respuesta content_script:", response);

      if (!response || !response.html || !response.img) {
        resultadoBox.textContent = "⚠️ No se pudo obtener contenido.";
        resultadoBox.className = "status-box status-red";
        return;
      }

      // ✅ LIMPIAR BASE64 DE IMAGEN ANTES DE ENVIAR
      const imagenBase64Limpia = response.img.replace(/^data:image\/(png|jpeg);base64,/, "");

      fetch("https://backend-checapage-2.onrender.com/analyze_content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: response.html,
          img: imagenBase64Limpia
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.prediction === 1) {
            resultadoBox.textContent = "🔴 Página maliciosa detectada";
            resultadoBox.className = "status-box status-red";
          } else if (data.prediction === 0) {
            resultadoBox.textContent = "🟢 Página segura";
            resultadoBox.className = "status-box status-green";
          } else {
            resultadoBox.textContent = "⚠️ Resultado desconocido.";
            resultadoBox.className = "status-box status-yellow";
          }
        })
        .catch(err => {
          console.error("❌ Error al analizar:", err);
          resultadoBox.textContent = "Error al conectar con el backend.";
          resultadoBox.className = "status-box status-red";
        });
    });
  });
});
