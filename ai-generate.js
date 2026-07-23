const fs = require('fs');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Use the free Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key');

async function generateTests() {
  console.log("🧠 Reading requirements from ai/requirements.md...");
  const requirement = fs.readFileSync('ai/requirements.md', 'utf8');

  // If no API key is provided, use a dummy test so the pipeline doesn't crash
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key') {
    console.log("⚠️ No GEMINI_API_KEY found. Generating a dummy test to keep pipeline running...");
    const dummyTest = `
import { test, expect } from '@playwright/test';
test('AI Placeholder: Login feature', async ({ page }) => {
  test.skip(true, 'Skipped: Gemini API key not configured in GitHub Secrets');
});
`;
    fs.writeFileSync('tests/ai-generated.spec.ts', dummyTest);
    return;
  }

  console.log("⏳ Asking Google Gemini (Free) to write Playwright tests...");
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an expert SDET. Output ONLY valid Playwright TypeScript code. Do not include markdown formatting like \`\`\`typescript. 
    Read this requirement and write Playwright tests for it. Use 'http://localhost:3000' as the base URL. Tag positive tests with @sanity and negative tests with @regression.
    
    ${requirement}`;

    const result = await model.generateContent(prompt);
    let aiCode = result.response.text();

    // Clean up any markdown wrappers just in case the AI adds them
    aiCode = aiCode.replace(/```typescript/g, '').replace(/```/g, '').trim();

    // Save the AI's code as a real test file!
    fs.writeFileSync('tests/ai-generated.spec.ts', aiCode);
    console.log("✅ Gemini successfully generated tests/ai-generated.spec.ts!");
  } catch (error) {
    console.error("❌ Error generating tests:", error.message);
    process.exit(1); // Fail the pipeline if AI fails
  }
}

generateTests();