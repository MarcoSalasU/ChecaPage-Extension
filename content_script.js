chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.tipo === "capturar_html_y_img") {
    // Capturar el HTML completo de la página actual
    const html = document.documentElement.outerHTML;

    // Solicitar a background.js que capture la pantalla
    chrome.runtime.sendMessage({ tipo: "capturar_screenshot" }, (respuesta) => {
      if (respuesta && respuesta.img) {
        sendResponse({ html: html, img: respuesta.img });
      } else {
        sendResponse({ html: html, img: null });
      }
    });

    // Necesario para mantener el canal abierto
    return true;
  }
});
