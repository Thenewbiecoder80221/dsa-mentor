console.log("✅ popup.js loaded");

chrome.runtime.sendMessage({ message: "get_latest_data" }, (data) => {
  if (chrome.runtime.lastError || !data) {
    updateUI({ hint: "No data", subtopic: "N/A", pseudocode: "N/A" });
  } else {
    updateUI(data);
  }
});

function updateUI(data) {
  document.getElementById("hint").innerText = data.hint || "N/A";
  document.getElementById("subtopic").innerText = data.subtopic || "N/A";
  document.getElementById("pseudocode").innerText = data.pseudocode || "N/A";
}
