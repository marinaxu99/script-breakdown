// server.js
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;

// Replace with your Gemini API key
const GEMINI_API_KEY = "AIzaSyBLxl1i1kU-H0__PDiy5DqHRfXiwV0FFw0";

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public")); // serve public folder

app.post("/analyze", async (req, res) => {
    try {
        const { script } = req.body;

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Goog-Api-Key": GEMINI_API_KEY,
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `Analyze this script for line production and return HTML where:
CAST underlined red,
EXTRAS underlined green,
PROPS underlined orange,
VEHICLES underlined blue,
SOUNDS underlined yellow,
MAKEUP AND HAIR underlined pink,
WARDROBE underlined violet,
STUNTS underlined brown,
SPECIAL DEFECTS underlined magenta,
CAMERA/GRIP underlined black.

${script}`
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();
        let analyzedScript = data.candidates?.[0]?.content?.parts?.[0]?.text || "No text returned";

        // Remove ```html or ``` wrappers
        analyzedScript = analyzedScript.replace(/^```html\s*/i, "").replace(/```$/i, "");

        // Replace color spans with semantic classes
        analyzedScript = analyzedScript
            .replace(/<span style="color:red">/gi, '<span class="cast">')
            .replace(/<span style="color:green">/gi, '<span class="extras">')
            .replace(/<span style="color:orange">/gi, '<span class="props">')
            .replace(/<span style="color:blue">/gi, '<span class="vehicles">')
            .replace(/<span style="color:yellow">/gi, '<span class="sounds">')
            .replace(/<span style="color:pink">/gi, '<span class="makeupHair">')
            .replace(/<span style="color:violet">/gi, '<span class="wardrobe">')
            .replace(/<span style="color:brown">/gi, '<span class="stunts">')
            .replace(/<span style="color:magenta">/gi, '<span class="specialDefects">')
            .replace(/<span style="color:black">/gi, '<span class="cameraGrip">');

        res.json({ analyzedScript });
    } catch (err) {
        console.error("Error processing script:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
