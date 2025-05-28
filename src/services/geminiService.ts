
const GEMINI_API_KEY = 'AIzaSyB3PbiunEBO9K1c_MuBCjl8yexCZTb9N1w';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export interface SlideAnalysis {
  slideNumber: number;
  highlight: string;
  risks: string[];
  improvements: string;
}

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
  slideAnalysis: SlideAnalysis[];
}

export const analyzePitchWithGemini = async (fileName: string): Promise<GeminiAnalysis> => {
  const prompt = `
【角色设定】
你现在是投资总监，正在奇绩创坛路演现场观看pitch。请用你标志性的直率风格，对创业者展示的每一页PPT进行专业而犀利的逐页点评，要求直击要害、揭示本质，同时保持建设性。

分析这个pitch deck文件: "${fileName}"

【输出要求】
对每一页PPT都进行如下反馈：
1. 分页式结构化反馈：
[页数] 
✓ 本页亮点（不超过1点）
⚠️ 致命隐患/逻辑漏洞（至少2点）
▶️ 改进建议（具体可执行）

2. 语言风格指南：
- 投资术语精准（PMF/单位经济/护城河等）
- 句式简短有力（例："这个ARR增长率根本撑不起估值"）
- 善用类比（例："就像试图用勺子挖运河"）
- 保持创业者能理解的犀利（禁用晦涩术语）

3. 重点关注维度：
□ 需求真实性（是否为伪需求）
□ 规模天花板（10亿美金底线）
□ 商业模式闭环（变现路径是否清晰）
□ 竞争壁垒（是否可复制）
□ 数据健康度（CAC/LTV比值等）
□ 团队基因匹配度

请用以下JSON格式回复，假设这是一个12页的pitch deck：

{
  "overallScore": number (0-100),
  "metrics": {
    "clarity": number (0-100),
    "market": number (0-100),
    "team": number (0-100),
    "traction": number (0-100),
    "financial": number (0-100)
  },
  "insights": ["insight1", "insight2", "insight3"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "slideAnalysis": [
    {
      "slideNumber": 1,
      "highlight": "清晰的问题陈述，直击痛点",
      "risks": ["市场规模证据不足", "竞争分析缺失"],
      "improvements": "补充具体的市场调研数据，至少3个竞品对比"
    }
  ]
}
`;

  try {
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 200) + '...');
    
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
          maxOutputTokens: 4096,
        }
      })
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      console.error('Gemini API error:', response.status, response.statusText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Raw Gemini response:', data);
    
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      console.error('No analysis text in response:', data);
      throw new Error('No analysis text received from Gemini');
    }

    console.log('Analysis text from Gemini:', analysisText);

    // Try to extract JSON from the response
    let jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // Try alternative extraction methods
      const lines = analysisText.split('\n');
      const jsonStart = lines.findIndex(line => line.trim().startsWith('{'));
      const jsonEnd = lines.findIndex(line => line.trim().endsWith('}'));
      
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonText = lines.slice(jsonStart, jsonEnd + 1).join('\n');
        jsonMatch = [jsonText];
      }
    }
    
    if (!jsonMatch) {
      console.error('No valid JSON found in Gemini response:', analysisText);
      throw new Error('No valid JSON found in Gemini response');
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonMatch[0]);
      console.log('Parsed analysis from Gemini:', analysis);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Raw JSON:', jsonMatch[0]);
      throw new Error('Failed to parse JSON from Gemini response');
    }
    
    // Validate the analysis structure
    if (!analysis.slideAnalysis || !Array.isArray(analysis.slideAnalysis)) {
      console.warn('Invalid slideAnalysis in response, using fallback');
      analysis.slideAnalysis = generateMockSlideAnalysis();
    }
    
    return analysis;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to mock data if API fails
    return generateMockAnalysis(fileName);
  }
};

const generateMockSlideAnalysis = (): SlideAnalysis[] => {
  return [
    {
      slideNumber: 1,
      highlight: "问题定义精准，直击用户痛点",
      risks: ["市场规模缺乏权威数据支撑", "用户需求的紧迫性论证不足"],
      improvements: "补充第三方市场调研报告，增加用户访谈数据"
    },
    {
      slideNumber: 2,
      highlight: "解决方案技术路径清晰",
      risks: ["技术壁垒不够高", "可被大厂快速复制"],
      improvements: "强化核心技术的专利布局，突出算法优势"
    },
    {
      slideNumber: 3,
      highlight: "商业模式闭环逻辑合理",
      risks: ["单位经济模型假设过于乐观", "规模化成本控制存疑"],
      improvements: "提供保守情况下的财务预测，增加成本结构分析"
    },
    {
      slideNumber: 4,
      highlight: "市场时机把握精准",
      risks: ["TAM计算方法存在水分", "竞争格局分析过于简化"],
      improvements: "使用bottom-up方法重新计算市场规模，增加竞品深度分析"
    },
    {
      slideNumber: 5,
      highlight: "产品功能演示直观有效",
      risks: ["用户体验优势难以量化", "产品迭代速度可能跟不上需求"],
      improvements: "增加用户满意度数据，展示产品roadmap"
    },
    {
      slideNumber: 6,
      highlight: "增长数据趋势良好",
      risks: ["用户获取成本上升趋势明显", "留存率在关键节点有下滑"],
      improvements: "详细分析CAC上升原因，制定用户留存改善计划"
    }
  ];
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
      "商业模式具备可扩展性，单位经济效益清晰",
      "团队背景与市场需求高度匹配",
      "护城河建设思路明确，具备先发优势"
    ],
    recommendations: [
      "加强CAC/LTV数据透明度，证明增长的可持续性",
      "补充竞争壁垒的量化指标",
      "提供更具体的市场渗透率预测"
    ],
    strengths: [
      "PMF验证充分，用户留存数据健康",
      "商业化路径清晰，变现能力强"
    ],
    weaknesses: [
      "市场天花板论证不够充分",
      "团队技术基因需要补强"
    ],
    slideAnalysis: generateMockSlideAnalysis()
  };
};
