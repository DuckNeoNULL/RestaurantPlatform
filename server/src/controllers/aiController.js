import dotenv from "dotenv";
import {GoogleGenerativeAI} from "@google/generative-ai";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({model: "gemini-pro"});

export const chatWithGemini = async (req,res) => {
    try{
        const {message} = req.body;
        if(!message) return res.status(400).json({error : "Missing message in body's request"});
        
        const result = await model.generateContent(message);
        const reply = result.response.text();

        res.json({reply});
    }catch(error){
        console.error("Gemini API error", error);
        res.status(500).json({error : "Error while calling GEMINI API"});
    }
};