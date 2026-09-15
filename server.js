import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;

if (!API_KEY) {
    console.error("❌ No OPENROUTER_API_KEY found in .env");
    process.exit(1);
}

app.get("/", (req, res) => {
    res.json({
        ok: true,
        message: "CodeOS backend is running 👾"
    });
});

app.post("/api/ai", async (req, res) => {

    try {

        const {
    messages,
    model = "openrouter/free"
} = req.body;

        if (!Array.isArray(messages)) {

            return res.status(400).json({
                ok: false,
                error: "messages must be an array."
            });

        }

        console.log("🤖 Sending to OpenRouter");
console.log("🧠 Model:", model);
console.log("📨 Messages:", messages);

        const response = await fetch(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                method: "POST",

                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json",
                    "X-Title": "CodeOS"
                },

                body: JSON.stringify({
                    model,
                    messages,
                    stream: false
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            return res.status(response.status).json({
                ok: false,
                error:
                    data?.error?.message ||
                    "OpenRouter request failed."
            });

        }

        const answer =
            data?.choices?.[0]?.message?.content;

        if (!answer) {

            return res.status(502).json({
                ok: false,
                error: "AI returned no answer."
            });

        }

        res.json({
            ok: true,
            answer
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message
        });

    }

});

app.listen(PORT, () => {

    console.log("");
    console.log("👾 CodeOS Backend");
    console.log(
        `🚀 http://localhost:${PORT}`
    );
    console.log(
        `🤖 http://localhost:${PORT}/api/ai`
    );
    console.log("");

});