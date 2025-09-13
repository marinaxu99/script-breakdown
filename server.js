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
                                    text: `Analyze the following screenplay for line production purposes and return HTML-formatted text with the following rules applied:

- CAST (underline in red): Characters with speaking roles or significant screen presence.
- EXTRAS (underline in green): Background characters without speaking lines, only present for atmosphere.
- PROPS (underline in orange): Objects that characters interact with or that are essential to the scene's action (do NOT include generic items not interacted with).
- VEHICLES (underline in blue): All modes of transportation in the scene (cars, wagons, motorcycles, etc.).
- SOUNDS (underline in yellow): Audible elements integral to the scene's atmosphere or action (engine noise, footsteps, ambient sounds, etc.).
- MAKEUP AND HAIR (underline in pink): Cosmetic and hairstyling requirements for characters, including wounds, prosthetics, or special effects makeup.
- WARDROBE (underline in violet): Clothing and accessories worn by characters, including continuity items.
- STUNTS (underline in brown): Physical actions or sequences performed by actors or stunt doubles (fights, falls, explosions, car chases).
- SPECIAL DEFECTS (underline in magenta): Any unique physical conditions, marks, or injuries that affect a character.
- CAMERA/GRIP (underline in black): Camera equipment, rigging, and related personnel.

Apply the underlines to the **relevant words or phrases in the text**, not just the category name. Ensure that PROPS are only objects actively interacted with by characters, and avoid misclassifying all objects as props. Preserve the original spacing and script formatting in the HTML output.

Script to analyze:

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
