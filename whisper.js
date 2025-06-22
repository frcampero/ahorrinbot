const { OpenAI } = require ("openai");
const fs = require("fs");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function transcribirAudio(filePath) {
    const audioStream = fs.createReadStream(filePath);

    const transcription = await openai.audio.transcriptions.create({
        file: audioStream,
        model: "whisper-1",
        response_format: "text",
        language: "es"
    })

    return transcription
}

module.exports = { transcribirAudio }