chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.tipo === "capturar_screenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "jpeg", quality: 60 }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        console.error("❌ Error al capturar:", chrome.runtime.lastError);
        sendResponse({ img: null });
      } else {
        // Limpiar el prefijo de data URL y enviar solo el base64
        const base64Limpio = dataUrl.replace(/^data:image\/jpeg;base64,/, "");
        sendResponse({ img: base64Limpio });
      }
    });

    return true; // Importante para mantener sendResponse abierto
  }
}); 