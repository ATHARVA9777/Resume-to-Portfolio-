
import { GoogleGenAI, Type } from "@google/genai";
import { ResumeData } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const RESUME_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    title: { type: Type.STRING },
    summary: { type: Type.STRING },
    contact: {
      type: Type.OBJECT,
      properties: {
        email: { type: Type.STRING },
        phone: { type: Type.STRING },
        location: { type: Type.STRING },
        linkedIn: { type: Type.STRING },
        github: { type: Type.STRING },
        website: { type: Type.STRING },
      },
      required: ["email", "location"],
    },
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    experience: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          company: { type: Type.STRING },
          position: { type: Type.STRING },
          startDate: { type: Type.STRING },
          endDate: { type: Type.STRING },
          highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["company", "position", "startDate", "endDate"],
      },
    },
    education: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          institution: { type: Type.STRING },
          degree: { type: Type.STRING },
          field: { type: Type.STRING },
          graduationDate: { type: Type.STRING },
        },
        required: ["institution", "degree", "graduationDate"],
      },
    },
    projects: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          technologies: { type: Type.ARRAY, items: { type: Type.STRING } },
          link: { type: Type.STRING },
        },
        required: ["title", "description"],
      },
    },
  },
  required: ["fullName", "title", "summary", "contact", "skills", "experience", "education"],
};

export const parseResumeText = async (text: string): Promise<ResumeData> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract the following resume information from the text provided. If information is missing, provide reasonable defaults or empty strings. Text: \n\n ${text}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: RESUME_SCHEMA,
    },
  });

  return JSON.parse(response.text || '{}');
};

export const getChatResponse = async (message: string, context?: ResumeData) => {
  const systemInstruction = `You are the PortfoliAI Assistant. Your goal is to help users improve their resume data and design their professional portfolio website. 
  
Current Context:
User Name: ${context?.fullName || 'Not provided'}
Title: ${context?.title || 'Not provided'}
Summary: ${context?.summary || 'Not provided'}

Be professional, encouraging, and provide constructive feedback on their resume content or portfolio style.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: {
      systemInstruction: systemInstruction,
    },
  });

  return response.text;
};
