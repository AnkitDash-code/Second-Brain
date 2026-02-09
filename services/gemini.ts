import { GoogleGenAI, Type, Modality } from '@google/genai';
import { Memory, Sentiment, ActionItem } from '../types';

// Use gemini-3-flash-preview as the standard multimodal model.
const MODEL_NAME = 'gemini-3-flash-preview';

// Initialize the client
const apiKey = process.env.API_KEY ? String(process.env.API_KEY) : "";
const ai = new GoogleGenAI({ apiKey });

// Helper to check for user-selected API key (required for Veo)
// @ts-ignore
const hasSelectedApiKey = async () => typeof window !== 'undefined' && window.aistudio && await window.aistudio.hasSelectedApiKey();
// @ts-ignore
const openSelectKey = async () => typeof window !== 'undefined' && window.aistudio && await window.aistudio.openSelectKey();

interface AnalysisResult {
  content: string;
  tags: string[];
  sentiment: Sentiment;
  entities: string[];
  action: ActionItem;
  confidenceScore: number;
}

/**
 * Converts a Blob to a Base64 string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      if (!result) {
        reject(new Error("Failed to read blob"));
        return;
      }
      const parts = result.split(',');
      const base64 = parts.length > 1 ? parts[1] : "";
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const commonSchemaProperties = {
  content: { type: Type.STRING },
  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
  sentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative'] },
  entities: { type: Type.ARRAY, items: { type: Type.STRING } },
  confidenceScore: { type: Type.NUMBER, description: "Confidence score between 0.0 and 1.0 indicating how certain the model is about the analysis." },
  action: {
    type: Type.OBJECT,
    properties: {
      type: { type: Type.STRING, enum: ['task', 'event', 'none'] },
      description: { type: Type.STRING },
      date: { type: Type.STRING }
    }
  }
};

/**
 * Analyzes text input.
 */
export const analyzeText = async (text: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            text: `Analyze this note: "${text}". 
            1. Return the content as is (content).
            2. Generate 3-5 tags.
            3. Determine sentiment (positive, neutral, negative).
            4. Extract names of people (entities).
            5. Identify if there is a task or event implied (action).
            6. Provide a confidence score (0.0 to 1.0) for this analysis.
            Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: commonSchemaProperties
        }
      }
    });

    const responseText = response.text || "{}";
    const data = JSON.parse(responseText);
    
    return {
      content: data.content || text,
      tags: data.tags || [],
      sentiment: (data.sentiment as Sentiment) || 'neutral',
      entities: data.entities || [],
      confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.9,
      action: {
        type: data.action?.type || 'none',
        description: data.action?.description || '',
        date: data.action?.date || '',
        completed: false
      }
    };
  } catch (error) {
    console.error("Gemini Text Error:", error);
    return { 
      content: text, 
      tags: ["note"], 
      sentiment: 'neutral', 
      entities: [], 
      confidenceScore: 0.5,
      action: { type: 'none', description: '', completed: false } 
    };
  }
};

/**
 * Analyzes video content.
 */
export const analyzeVideo = async (videoBlob: Blob): Promise<AnalysisResult> => {
  try {
    const base64Data = await blobToBase64(videoBlob);
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: videoBlob.type, 
              data: base64Data
            }
          },
          {
            text: `Analyze this video. 
            1. Provide a summary description of what happens (content).
            2. Generate 3-5 tags.
            3. Determine sentiment (positive, neutral, negative).
            4. Extract names of people or pets visibly present (entities).
            5. Identify if there is a task or event implied (action).
            6. Provide a confidence score (0.0 to 1.0) for this analysis.
            Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: commonSchemaProperties
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    return {
      content: data.content || "Video analyzed.",
      tags: data.tags || [],
      sentiment: (data.sentiment as Sentiment) || 'neutral',
      entities: data.entities || [],
      confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.8,
      action: {
        type: data.action?.type || 'none',
        description: data.action?.description || '',
        date: data.action?.date || '',
        completed: false
      }
    };
  } catch (error) {
    console.error("Gemini Video Error:", error);
    return { 
      content: "Could not analyze video.", 
      tags: ["video"], 
      sentiment: 'neutral', 
      entities: [], 
      confidenceScore: 0,
      action: { type: 'none', description: '', completed: false } 
    };
  }
};

/**
 * Analyzes an image.
 */
export const analyzeImage = async (imageBlob: Blob): Promise<AnalysisResult> => {
  try {
    const base64Data = await blobToBase64(imageBlob);
    
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageBlob.type,
              data: base64Data
            }
          },
          {
            text: `Analyze this image. 
            1. Provide a description (content).
            2. Generate 3-5 tags.
            3. Determine sentiment (positive, neutral, negative).
            4. Extract names of people or specific pets (entities).
            5. Identify if there is a task or event implied (action).
            6. Provide a confidence score (0.0 to 1.0) for this analysis.
            Return JSON.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: commonSchemaProperties
        }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    
    return {
      content: data.content || "Image analyzed.",
      tags: data.tags || [],
      sentiment: (data.sentiment as Sentiment) || 'neutral',
      entities: data.entities || [],
      confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.85,
      action: {
        type: data.action?.type || 'none',
        description: data.action?.description || '',
        date: data.action?.date || '',
        completed: false
      }
    };
  } catch (error) {
    console.error("Gemini Vision Error:", error);
    return { 
      content: "Could not analyze image.", 
      tags: ["image"], 
      sentiment: 'neutral', 
      entities: [], 
      confidenceScore: 0,
      action: { type: 'none', description: '', completed: false } 
    };
  }
};

/**
 * Transcribes and analyzes audio.
 */
export const processAudio = async (audioBlob: Blob): Promise<AnalysisResult> => {
  try {
    const base64Data = await blobToBase64(audioBlob);

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: audioBlob.type.split(';')[0] || 'audio/webm', 
              data: base64Data
            }
          },
          {
            text: `Transcribe this audio. 
            1. Provide exact transcription (content).
            2. Generate 3-5 tags.
            3. Determine sentiment (positive, neutral, negative).
            4. Extract names of people (entities).
            5. Identify if there is a task or event implied (action).
            6. Provide a confidence score (0.0 to 1.0) for this analysis.
            Return JSON.`
          }
        ]
      },
      config: {
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.OBJECT,
            properties: commonSchemaProperties
         }
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);

    return {
      content: data.content || "Audio processed.",
      tags: data.tags || [],
      sentiment: (data.sentiment as Sentiment) || 'neutral',
      entities: data.entities || [],
      confidenceScore: typeof data.confidenceScore === 'number' ? data.confidenceScore : 0.85,
      action: {
        type: data.action?.type || 'none',
        description: data.action?.description || '',
        date: data.action?.date || '',
        completed: false
      }
    };
  } catch (error) {
    console.error("Gemini Audio Error:", error);
    return { 
      content: "Could not process audio.", 
      tags: ["audio", "error"], 
      sentiment: 'neutral', 
      entities: [], 
      confidenceScore: 0,
      action: { type: 'none', description: '', completed: false } 
    };
  }
};

/**
 * Chat with the Second Brain using stored memories as context.
 */
export const chatWithMemories = async (query: string, memories: Memory[]): Promise<string> => {
  // Same logic as before
  try {
    const sortedMemories = [...memories].sort((a, b) => b.timestamp - a.timestamp).slice(0, 100);
    const contextString = sortedMemories.map(m => {
      const date = new Date(m.timestamp).toLocaleDateString();
      return `[ID:${m.id} | Date:${date} | Type:${m.type}] ${m.content}`;
    }).join('\n');

    const prompt = `
    You are a "Second Brain" assistant.
    USER MEMORIES (Context):
    ${contextString}

    USER QUESTION:
    ${query}

    INSTRUCTIONS:
    - Answer based ONLY on the provided memories.
    - Use strict citation format: "[Date: <date>, Type: <type>]".
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "I'm having trouble thinking right now.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I couldn't connect to my thought process.";
  }
};

export const generateStory = async (memories: Memory[], timeRange: string): Promise<string> => {
  // Same logic as before
   try {
    const sortedMemories = [...memories].sort((a, b) => a.timestamp - b.timestamp).slice(0, 50); 
    if (sortedMemories.length === 0) return "No memories found to tell a story about.";

    const contextString = sortedMemories.map(m => {
      const date = new Date(m.timestamp).toLocaleDateString();
      return `[${date}] ${m.content} (Sentiment: ${m.sentiment})`;
    }).join('\n');

    const prompt = `
    You are a master storyteller. 
    The user wants to hear a narrative about their life based on their recorded memories for: ${timeRange}.
    MEMORIES:
    ${contextString}
    INSTRUCTIONS:
    - Weave these disjointed memories into a cohesive, heartwarming, and engaging short story (approx 300 words).
    - Use first person "I".
    - Reflect the sentiment.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "I couldn't generate a story at this time.";
  } catch (error) {
    console.error("Gemini Story Error:", error);
    return "Sorry, I had trouble writing your story.";
  }
};

// --- NEW FEATURE: Text-to-Speech ---
export const generateStorySpeech = async (text: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return `data:audio/wav;base64,${base64Audio}`;
    }
    return null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

// --- NEW FEATURE: Video Generation (Veo Avatar) ---
export const generateStoryVideo = async (summary: string): Promise<string | null> => {
  try {
    if (!await hasSelectedApiKey()) {
       await openSelectKey();
       // Check again or fail
       if (!await hasSelectedApiKey()) return null;
    }

    // Refresh AI client with new key just in case (though we use process.env usually, Veo flow is special in Studio)
    // In this specific code env, process.env.API_KEY is updated automatically if the user selects it in the popup.
    const freshAi = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

    // Generate a specific avatar video 
    const prompt = `A friendly, warm, photorealistic video of a kind elderly storyteller character sitting in a cozy library, looking at the camera and listening. 
    The character has a kind smile, wearing comfortable clothes. Soft warm lighting, 4k, cinematic. 
    The mood matches this story: ${summary}`;

    let operation = await freshAi.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    });

    // Poll for completion
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Check every 5s
      operation = await freshAi.operations.getVideosOperation({operation: operation});
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        // We must append key to fetch
        const videoUrl = `${downloadLink}&key=${process.env.API_KEY}`;
        return videoUrl;
    }
    return null;

  } catch (error) {
    console.error("Veo Video Error:", error);
    return null;
  }
};