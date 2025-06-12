chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.tipo === "capturar_screenshot") {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        sendResponse({ img: null });
      } else {
        sendResponse({ img: dataUrl.replace("data:image/png;base64,", "") });
      }
    });

    return true; // Importante para mantener sendResponse abierto
  }
});
