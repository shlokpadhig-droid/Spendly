import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 images
  app.use(express.json({ limit: '10mb' }));

  // API route for AI Receipt Scanner
  app.post('/api/scan-receipt', async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;

      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: 'Image data and mimeType are required' });
      }

      console.log('Sending image to Gemini...');

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: [
          {
            inlineData: {
              data: imageBase64,
              mimeType: mimeType,
            },
          },
          {
            text: "Analyze this receipt. Return ONLY a valid JSON object with no markdown formatting. Schema required: { 'merchant_name': string, 'date': string (YYYY-MM-DD), 'total_amount': number, 'tax_amount': number, 'currency': string, 'predicted_category': string }."
          }
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              merchant_name: { type: Type.STRING },
              date: { type: Type.STRING },
              total_amount: { type: Type.NUMBER },
              tax_amount: { type: Type.NUMBER },
              currency: { type: Type.STRING },
              predicted_category: { type: Type.STRING }
            },
            required: ['merchant_name', 'date', 'total_amount', 'tax_amount', 'currency', 'predicted_category']
          }
        }
      });

      const text = response.text || '';
      let jsonResponse;
      try {
        jsonResponse = JSON.parse(text);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', text);
        return res.status(500).json({ error: 'Invalid response from AI' });
      }
      
      return res.json(jsonResponse);
    } catch (error: any) {
      console.error('/api/scan-receipt error:', error);
      res.status(500).json({ error: error.message || 'Error processing receipt' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: Node 22+ with type module handles import.meta.dirname, but if not available we can use process.cwd()
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
