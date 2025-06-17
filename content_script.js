chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.tipo === "capturar_html_y_img_y_iframes") {
    const html = document.documentElement.outerHTML;
    const iframes = document.querySelectorAll("iframe").length;

    chrome.runtime.sendMessage({ tipo: "capturar_screenshot" }, (respuesta) => {
      sendResponse({
        html: html,
        img: respuesta?.img || null,
        iframes: iframes
      });
    });

    return true; // mantener canal abierto
  }
});

// Detectar iframes al cargar la página
/*
(() => {
  const iframes = document.querySelectorAll("iframe");
  if (iframes.length > 0) {
    chrome.runtime.sendMessage({
      tipo: "hay_iframe",
      cantidad: iframes.length
    });
  }
})(); 
*/

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.tipo === "verificar_iframes") {
    const iframes = document.querySelectorAll("iframe");
    if (iframes.length > 0) {
      chrome.runtime.sendMessage({
        tipo: "hay_iframe",
        cantidad: iframes.length
      });
    }
  }
});