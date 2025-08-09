
export async function callGeminiAPI(prompt: string): Promise<string | null> {
  try {
   
    const apiKey = "Your_Gemini_API_Key_Here_:)"; // Replace with your actual API key or use environment variables
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Gemini API Error:", errorBody);
      // Provide a more user-friendly error message
      throw new Error(errorBody?.error?.message || `API request failed with status ${response.status}`);
    }

    const result = await response.json();

    if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
      return result.candidates[0].content.parts[0].text.trim();
    } else {
      console.error("Unexpected API response structure:", result);
      throw new Error("Failed to get a valid response from the AI.");
    }
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    // Re-throw the error so the calling component can handle it (e.g., show a modal)
    throw error;
  }
}
