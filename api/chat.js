export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const { message } = req.body || {};

        if (!message) {
            return res.status(400).json({
                error: "Message is missing"
            });
        }

        if (!process.env.API_KEY) {
            return res.status(500).json({
                error: "API_KEY is not configured"
            });
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.API_KEY
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text:
                                        "Answer in simple language. " +
                                        "Keep the answer short and beginner friendly. " +
                                        "Do not give advanced details unless asked. " +
                                        "User question: " +
                                        message
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);

            return res.status(response.status).json({
                error: data.error?.message || "Gemini API request failed"
            });
        }

        const answer =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!answer) {
            return res.status(500).json({
                error: "No answer received from Gemini"
            });
        }

        return res.status(200).json({
            answer: answer
        });

    } catch (error) {
        console.error("Server Error:", error);

        return res.status(500).json({
            error: error.message || "Something went wrong"
        });
    }
}