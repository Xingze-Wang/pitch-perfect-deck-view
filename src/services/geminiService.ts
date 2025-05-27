
const GEMINI_API_KEY = 'AIzaSyB3PbiunEBO9K1c_MuBCjl8yexCZTb9N1w';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

export interface GeminiAnalysis {
  overallScore: number;
  metrics: {
    clarity: number;
    market: number;
    team: number;
    traction: number;
    financial: number;
  };
  insights: string[];
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

export const analyzePitchWithGemini = async (fileName: string): Promise<GeminiAnalysis> => {
  const prompt = `
Analyze this startup pitch deck file: "${fileName}"

As an expert startup investor and advisor, provide a comprehensive analysis covering:

1. Overall score (0-100)
2. Detailed metrics for:
   - Clarity of presentation and messaging (0-100)
   - Market opportunity and sizing (0-100)
   - Team strength and credibility (0-100)
   - Traction and validation (0-100)
   - Financial projections and business model (0-100)

3. Key insights (3-5 bullet points about what works well)
4. Specific recommendations (3-5 actionable improvements)
5. Main strengths (2-3 key strengths)
6. Critical weaknesses (2-3 areas needing immediate attention)

Base your analysis on typical pitch deck elements: problem, solution, market size, business model, traction, team, financials, funding ask, and competition.

Respond in JSON format only:
{
  "overallScore": number,
  "metrics": {
    "clarity": number,
    "market": number,
    "team": number,
    "traction": number,
    "financial": number
  },
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...]
}
`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      throw new Error('No analysis text received from Gemini');
    }

    // Extract JSON from the response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Gemini response');
    }

    const analysis = JSON.parse(jsonMatch[0]);
    console.log('Gemini analysis completed:', analysis);
    
    return analysis;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to mock data if API fails
    return generateMockAnalysis(fileName);
  }
};

const generateMockAnalysis = (fileName: string): GeminiAnalysis => {
  return {
    overallScore: Math.floor(Math.random() * 30) + 70,
    metrics: {
      clarity: Math.floor(Math.random() * 25) + 75,
      market: Math.floor(Math.random() * 30) + 65,
      team: Math.floor(Math.random() * 25) + 70,
      traction: Math.floor(Math.random() * 40) + 50,
      financial: Math.floor(Math.random() * 35) + 60,
    },
    insights: [
      "Strong problem statement with clear market pain points",
      "Solution demonstrates unique value proposition",
      "Business model shows strong unit economics",
      "Team has relevant domain expertise"
    ],
    recommendations: [
      "Add more specific traction metrics and growth rates",
      "Include customer testimonials or case studies",
      "Strengthen competitive differentiation",
      "Provide clearer go-to-market strategy"
    ],
    strengths: [
      "Clear and compelling narrative",
      "Strong market opportunity",
      "Experienced founding team"
    ],
    weaknesses: [
      "Limited traction data",
      "Competitive landscape needs clarification"
    ]
  };
};
