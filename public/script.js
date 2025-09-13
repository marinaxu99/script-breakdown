document.addEventListener("DOMContentLoaded", () => {
    const analyzeBtn = document.getElementById("analyzeBtn");
    const scriptInput = document.getElementById("scriptInput");
    const outputDiv = document.getElementById("output");

    analyzeBtn.addEventListener("click", async () => {
        const script = scriptInput.value.trim();
        if (!script) {
            outputDiv.innerHTML = "<span style='color:red'>Please paste a script first.</span>";
            return;
        }

        outputDiv.innerHTML = "<em>Processing...</em>";

        try {
            const response = await fetch("/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ script }),
            });

            if (!response.ok) throw new Error(`Server responded with status ${response.status}`);

            const data = await response.json();
            outputDiv.innerHTML = data.analyzedScript || "No text returned";
        } catch (err) {
            console.error("Error fetching /analyze:", err);
            outputDiv.innerHTML = `<span style="color:red">Error processing script: ${err.message}</span>`;
        }
    });
});
