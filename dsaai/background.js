console.log("DSA Mentor AI: background.js LOADED and listening");

// API key - secure this in production
const apiKey = "xai-0ScDm7AVZfXiBD2i6JJytTsXPEQmUXLXG4n4EtvCfus9ep5oYl9u8JomqlvrK3F0cCT5JBG73ZvCXUY2";

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
  console.log("Background ACTIVE, received message:", request.message, "from", sender.tab?.url);
  if (request.message === "process_problem") {
    const problem = request.problem;
    if (problem) {
      console.log("Processing problem:", problem.title.slice(0, 50));
      try {
        const response = await fetch("https://api.x.ai/v1/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "grok-3",
            prompt: `Given the problem: "${problem.title}\n\n${problem.description}", provide:
- A hint to solve it
- The subtopic (e.g., Array, Dynamic Programming)
- Pseudocode for the solution`,
            max_tokens: 200
          })
        });
        const data = await response.json();
        const result = {
          hint: data.choices[0].text.split("\n")[0].replace("- A hint: ", "").trim(),
          subtopic: data.choices[0].text.split("\n")[1].replace("- The subtopic: ", "").trim(),
          pseudocode: data.choices[0].text.split("\n")[2].replace("- Pseudocode: ", "").trim()
        };
        console.log("AI response:", result);
        sendResponse(result);
      } catch (error) {
        console.error("API call failed:", error.message);
        sendResponse({ hint: "Error fetching hint.", subtopic: "N/A", pseudocode: "N/A" });
      }
    } else {
      console.warn("No problem data received.");
      sendResponse({ hint: "No problem detected.", subtopic: "N/A", pseudocode: "N/A" });
    }
  } else if (request.message === "update_popup") {
    console.log("Updating popup with:", request.data);
    sendResponse();
  }
  return true;
});