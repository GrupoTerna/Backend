// =============================================================================
// 03_RoyaleAPI_Torneos.gs
// =============================================================================
function obtenerJSON_viaProxy() {
  // Intenta con allorigins (suele funcionar para RoyaleAPI)
  var url = "https://api.allorigins.win/raw?url=" + 
            encodeURIComponent("https://royaleapi.com/tournament/2JV8UCU8/members/json");
  
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  
  if (response.getResponseCode() === 200) {
    var datos = JSON.parse(response.getContentText());
    Logger.log("✅ Datos obtenidos con allorigins");
    return datos;
  } else {
    Logger.log("❌ allorigins falló con código: " + response.getResponseCode());
    // Intenta con un proxy alternativo si el primero falla
    return tryAlternativeProxy();
  }
}

function tryAlternativeProxy() {
  var url = "https://corsproxy.io/?" + 
            encodeURIComponent("https://royaleapi.com/tournament/2JV8UCU8/members/json");
  var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  
  if (response.getResponseCode() === 200) {
    var datos = JSON.parse(response.getContentText());
    Logger.log("✅ Datos obtenidos con corsproxy.io");
    return datos;
  } else {
    Logger.log("❌ corsproxy.io también falló: " + response.getResponseCode());
    return null;
  }
}