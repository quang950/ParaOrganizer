import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Enforce strict prompt definitions for the LLM based on PARA principles
const SYSTEM_PROMPT = `
You are the ParaOrganizer AI Classifier, an elite productivity expert specialized in Tiago Forte's PARA Method.
Your job is to read the metadata of a saved webpage, article, bookmark, or note (Title, URL, and optional snippet) and organize it into EXACTLY ONE of the four categories:

1. PROJECTS: Short-term efforts in your work or life that have a concrete goal and a clear, explicit deadline or target completion date. (e.g., "Launch marketing campaign by Q3", "Build React App", "Draft sales proposal for client X").
2. AREAS: Ongoing responsibilities that require continuous, long-term maintenance and attention over time. They do not have a final deadline but have a standard to maintain. (e.g., "Health & Fitness", "Home Maintenance", "Personal Finances", "Company Operations", "Tax returns 2026").
3. RESOURCES: Topics, interests, or assets of ongoing value. They are libraries of information, references, research, tools, or inspirations that you refer to. (e.g., "Rust programming guide", "Graphic design inspirations", "Healthy dinner recipes", "Figma design tokens").
4. ARCHIVES: Inactive items from the other three categories. Things that are completed, paused, expired, or no longer actively relevant. (e.g., "Completed Q1 Project", "Expired lease agreement 2022", "Old training plan").

You MUST return strictly a JSON object with this exact shape:
{
  "category": "PROJECTS" | "AREAS" | "RESOURCES" | "ARCHIVES",
  "reasoning": "A concise 1-sentence explanation of why it fits this category based strictly on the PARA guidelines provided above.",
  "confidence": 0.00 to 1.00
}
Do NOT include any markdown code blocks, backticks, or extra conversational text. Return only the raw JSON.
`;

// Helper smart regex heuristic for fallback sorting
const fallbackClassifier = (title = '', url = '') => {
  const lTitle = title.toLowerCase();
  const lUrl = url.toLowerCase();
  
  let category = 'RESOURCES';
  let reasoning = 'Classified as a Resource: It represents a topic of ongoing reference and interest without an explicit operational deadline.';
  let confidence = 0.85;

  // Projects logic (concrete goal or deadline)
  if (
    lTitle.includes('project') || 
    lTitle.includes('launch') || 
    lTitle.includes('roadmap') || 
    lTitle.includes('deadline') || 
    lTitle.includes('by q') || 
    lTitle.includes('build a') || 
    lTitle.includes('sprint') || 
    lTitle.includes('milestone')
  ) {
    category = 'PROJECTS';
    reasoning = 'Classified as a Project: The title indicates a short-term, output-driven effort with concrete delivery outcomes.';
    confidence = 0.90;
  }
  // Areas logic (ongoing maintenance)
  else if (
    lTitle.includes('health') || 
    lTitle.includes('routine') || 
    lTitle.includes('gym') || 
    lTitle.includes('finance') || 
    lTitle.includes('budget') || 
    lTitle.includes('tax') || 
    lTitle.includes('maintenance') || 
    lTitle.includes('operations') || 
    lTitle.includes('standard') ||
    lUrl.includes('bank') || 
    lUrl.includes('fitness')
  ) {
    category = 'AREAS';
    reasoning = 'Classified as an Area: Represents a continuous domain of responsibility requiring ongoing maintenance without a fixed completion date.';
    confidence = 0.88;
  }
  // Archives logic (expired or historical)
  else if (
    lTitle.includes('expired') || 
    lTitle.includes('old') || 
    lTitle.includes('archive') || 
    lTitle.includes('2022') || 
    lTitle.includes('2023') || 
    lTitle.includes('2024') || 
    lTitle.includes('former') ||
    lTitle.includes('completed')
  ) {
    category = 'ARCHIVES';
    reasoning = 'Classified as an Archive: The context points to an inactive, completed, or historically dated item.';
    confidence = 0.92;
  }

  return { category, reasoning, confidence };
};

export const classifyPage = async (title, url, contentSnippet = '') => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  const contentText = `Title: "${title}"\nURL: "${url}"\nSnippet: "${contentSnippet}"`;

  // 1. Try Gemini Integration
  if (geminiKey) {
    try {
      console.log('🤖 AI classification running via Gemini...');
      // Note: we use GoogleGenerativeAI which uses official SDK calls
      const ai = new GoogleGenerativeAI(geminiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: `${SYSTEM_PROMPT}\n\nContent to classify:\n${contentText}` }] }]
      });

      const text = response.text().trim();
      // Parse clean JSON
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      
      return {
        category: parsed.category,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence || 0.95
      };
    } catch (err) {
      console.warn('⚠️ Gemini classification error, trying fallbacks:', err.message);
    }
  }

  // 2. Try OpenAI Integration
  if (openaiKey) {
    try {
      console.log('🤖 AI classification running via OpenAI GPT-4o-mini...');
      const openai = new OpenAI({ apiKey: openaiKey });
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: contentText }
        ],
        response_format: { type: 'json_object' }
      });

      const parsed = JSON.parse(completion.choices[0].message.content);
      return {
        category: parsed.category,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence || 0.95
      };
    } catch (err) {
      console.warn('⚠️ OpenAI classification error, trying fallbacks:', err.message);
    }
  }

  // 3. Fallback Heuristic Classifier (Always succeeds, great for instant credential-free sandbox test)
  console.log('ℹ️ Running local smart heuristic classifier (No API Key configured)');
  return fallbackClassifier(title, url);
};
