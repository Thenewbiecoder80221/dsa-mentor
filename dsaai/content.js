console.log("DSA Mentor AI: content.js LOADED on", window.location.href);

function extractProblem() {
  console.log("🔍 Trying to extract problem...");

  let title = "";
  let desc = "";

  // Modern LeetCode Selectors (stable as of July 2025)
  const leetTitle = document.querySelector('[data-cy="question-title"]')?.innerText.trim();
  const leetDesc = document.querySelector('[data-cy="description-content"]')?.innerText.trim();

  if (leetTitle && leetDesc) {
    console.log("✅ LeetCode Detected:", leetTitle.slice(0, 50));
    return {
      title: leetTitle,
      description: leetDesc
    };
  }

  console.warn("❌ No valid problem data found.");
  return null;
}

function waitForProblemData(retries = 30, delay = 750) {
  let attempt = 0;

  const tryExtract = () => {
    const result = extractProblem();
    if (result) {
      chrome.runtime.sendMessage({ message: "process_problem", problem: result }, (response) => {
        console.log("✅ Response received:", response);
        if (!chrome.runtime.lastError) {
          updatePopup(response);
        }
      });
    } else if (attempt < retries) {
      console.log(`🔁 Retry ${attempt + 1}/${retries}`);
      attempt++;
      setTimeout(tryExtract, delay);
    } else {
      console.warn("❌ Failed to extract problem after retries.");
      chrome.runtime.sendMessage({ message: "process_problem", problem: null }, (response) => {
        console.log("Fallback response:", response);
        if (!chrome.runtime.lastError) {
          updatePopup(response || { hint: "No problem detected.", subtopic: "N/A", pseudocode: "N/A" });
        }
      });
    }
  };

  tryExtract();
}

function updatePopup(data) {
  chrome.runtime.sendMessage({ message: "update_popup", data }, () => {
    if (chrome.runtime.lastError) {
      console.error("❌ Popup update failed:", chrome.runtime.lastError.message);
    }
  });
}

waitForProblemData();
