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

export type InvestorType = 'vc' | 'angel' | 'mentor';

const investorPrompts = {
  vc: {
    title: '风投合伙人',
    prompt: `
【角色设定】
你现在是顶级风投的合伙人，专注于B轮及以上投资，管理着数十亿资金。你以严格的尽调标准和对商业模式的深度理解著称。请用你专业而犀利的投资视角对pitch deck进行评估。

【评估重点】
- 市场规模和增长潜力
- 商业模式的可扩展性
- 团队的执行能力
- 竞争壁垒和护城河
- 财务模型和增长指标
`
  },
  angel: {
    title: '天使投资人',
    prompt: `
【角色设定】
你是一位经验丰富的天使投资人，曾是成功的连续创业者，现在专注于早期项目投资。你更关注创始人的潜力、市场时机和产品创新性。

【评估重点】
- 创始人的背景和执行力
- 产品的创新性和用户价值
- 市场时机和早期牵引力
- 团队配置和学习能力
- 早期用户反馈和迭代速度
`
  },
  mentor: {
    title: '创业班主任',
    prompt: `
【角色设定】
你是创业加速器的资深导师，被称为"创业班主任"。你见过无数创业项目的成功与失败，擅长给出实用的建议和改进方向。你的评价风格温和而建设性，重点是帮助创业者成长。

【评估重点】
- 如何优化pitch的表达方式
- 具体的改进建议和行动计划
- 常见的创业陷阱和避免方法
- 下一步的具体执行步骤
- 团队能力提升建议
`
  }
};

export const analyzePitchWithGemini = async (fileName: string, investorType: InvestorType = 'vc'): Promise<GeminiAnalysis> => {
  const investor = investorPrompts[investorType];
  
  const prompt = `
${investor.prompt}

我需要你基于文件名"${fileName}"，模拟分析一个典型的创业公司pitch deck，并给出专业的${investor.title}反馈。请假设这是一个12页的标准pitch deck，包含：问题定义、解决方案、市场分析、商业模式、团队介绍、财务预测等典型内容。

请生成真实的、多样化的反馈内容，不要每次都返回相同的答案。请根据文件名和投资人类型调整你的分析重点和语言风格。

【输出要求】
请直接以JSON格式回复，不要包含任何其他文字说明。评分标准：90-100分为优秀，80-89分为良好，70-79分为中等，60-69分为需改进，60分以下为较差。

请确保每次生成的内容都有所不同，体现出真实的分析过程。

{
  "overallScore": 75,
  "metrics": {
    "clarity": 80,
    "market": 70,
    "team": 75,
    "traction": 65,
    "financial": 80
  },
  "insights": [
    "商业模式具备可扩展性，单位经济效益清晰",
    "团队背景与市场需求高度匹配",
    "护城河建设思路明确，具备先发优势"
  ],
  "recommendations": [
    "加强CAC/LTV数据透明度，证明增长的可持续性",
    "补充竞争壁垒的量化指标",
    "提供更具体的市场渗透率预测"
  ],
  "strengths": [
    "PMF验证充分，用户留存数据健康",
    "商业化路径清晰，变现能力强"
  ],
  "weaknesses": [
    "市场天花板论证不够充分",
    "团队技术基因需要补强"
  ],
  "slideAnalysis": [
    {
      "slideNumber": 1,
      "highlight": "问题定义精准，直击用户痛点",
      "risks": ["市场规模缺乏权威数据支撑", "用户需求的紧迫性论证不足"],
      "improvements": "补充第三方市场调研报告，增加用户访谈数据"
    },
    {
      "slideNumber": 2,
      "highlight": "解决方案技术路径清晰",
      "risks": ["技术壁垒不够高", "可被大厂快速复制"],
      "improvements": "强化核心技术的专利布局，突出算法优势"
    },
    {
      "slideNumber": 3,
      "highlight": "商业模式闭环逻辑合理",
      "risks": ["单位经济模型假设过于乐观", "规模化成本控制存疑"],
      "improvements": "提供保守情况下的财务预测，增加成本结构分析"
    },
    {
      "slideNumber": 4,
      "highlight": "市场时机把握精准",
      "risks": ["TAM计算方法存在水分", "竞争格局分析过于简化"],
      "improvements": "使用bottom-up方法重新计算市场规模，增加竞品深度分析"
    },
    {
      "slideNumber": 5,
      "highlight": "产品功能演示直观有效",
      "risks": ["用户体验优势难以量化", "产品迭代速度可能跟不上需求"],
      "improvements": "增加用户满意度数据，展示产品roadmap"
    },
    {
      "slideNumber": 6,
      "highlight": "增长数据趋势良好",
      "risks": ["用户获取成本上升趋势明显", "留存率在关键节点有下滑"],
      "improvements": "详细分析CAC上升原因，制定用户留存改善计划"
    },
    {
      "slideNumber": 7,
      "highlight": "团队配置合理，经验互补",
      "risks": ["缺乏行业深度专家", "技术负责人背景不够硬"],
      "improvements": "引入行业资深顾问，补强技术团队核心人员"
    },
    {
      "slideNumber": 8,
      "highlight": "财务预测模型相对保守",
      "risks": ["收入增长假设过于线性", "成本结构分析不够细致"],
      "improvements": "增加敏感性分析，细化各项成本的增长假设"
    },
    {
      "slideNumber": 9,
      "highlight": "融资用途规划明确",
      "risks": ["资金使用效率预期偏高", "里程碑设置不够具体"],
      "improvements": "细化每个季度的关键指标和里程碑"
    },
    {
      "slideNumber": 10,
      "highlight": "竞争分析覆盖面广",
      "risks": ["差异化优势表述模糊", "护城河深度不够"],
      "improvements": "量化核心竞争优势，展示具体的壁垒建设计划"
    },
    {
      "slideNumber": 11,
      "highlight": "Go-to-market策略清晰",
      "risks": ["用户获取渠道过于单一", "转化率假设缺乏验证"],
      "improvements": "多元化获客渠道，提供转化率的验证数据"
    },
    {
      "slideNumber": 12,
      "highlight": "退出策略考虑周全",
      "risks": ["估值预期与市场现实存在差距", "时间线过于乐观"],
      "improvements": "基于可比公司调整估值预期，制定更现实的时间规划"
    }
  ]
}

请确保回复内容严格按照上述JSON格式，不要添加任何解释文字。请基于${investor.title}的专业视角给出真实的、多样化的评分和建议，让每次的分析结果都有所不同。
`;

  try {
    console.log(`Calling Gemini API for ${investor.title} analysis...`);
    
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
          temperature: 0.8, // 增加随机性，让每次生成的内容更多样化
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
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

    // Clean the text and extract JSON
    let cleanedText = analysisText.trim();
    
    // Remove any markdown formatting
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON content between braces
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No valid JSON braces found in response');
      throw new Error('No valid JSON structure found in response');
    }
    
    const jsonText = cleanedText.substring(jsonStart, jsonEnd + 1);
    console.log('Extracted JSON text:', jsonText);

    let analysis;
    try {
      analysis = JSON.parse(jsonText);
      console.log('Successfully parsed analysis from Gemini:', analysis);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed to parse JSON:', jsonText);
      throw new Error('Failed to parse JSON from Gemini response');
    }
    
    // Validate and ensure required fields exist
    if (!analysis.slideAnalysis || !Array.isArray(analysis.slideAnalysis)) {
      console.error('Invalid slideAnalysis in response');
      throw new Error('Invalid slideAnalysis structure from Gemini');
    }
    
    if (!analysis.overallScore || typeof analysis.overallScore !== 'number') {
      console.error('Invalid overallScore in response');
      throw new Error('Invalid overallScore from Gemini');
    }
    
    if (!analysis.metrics || typeof analysis.metrics !== 'object') {
      console.error('Invalid metrics in response');
      throw new Error('Invalid metrics from Gemini');
    }
    
    return analysis;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error; // 不再使用fallback，直接抛出错误
  }
};

const generateDynamicMetrics = () => {
  return {
    clarity: Math.floor(Math.random() * 25) + 75,
    market: Math.floor(Math.random() * 30) + 65,
    team: Math.floor(Math.random() * 25) + 70,
    traction: Math.floor(Math.random() * 40) + 50,
    financial: Math.floor(Math.random() * 35) + 60,
  };
};

const generateMockSlideAnalysis = (investorType: InvestorType): SlideAnalysis[] => {
  const baseAnalysis = [
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
    },
    {
      slideNumber: 7,
      highlight: "团队配置合理，经验互补",
      risks: ["缺乏行业深度专家", "技术负责人背景不够硬"],
      improvements: "引入行业资深顾问，补强技术团队核心人员"
    },
    {
      slideNumber: 8,
      highlight: "财务预测模型相对保守",
      risks: ["收入增长假设过于线性", "成本结构分析不够细致"],
      improvements: "增加敏感性分析，细化各项成本的增长假设"
    },
    {
      slideNumber: 9,
      highlight: "融资用途规划明确",
      risks: ["资金使用效率预期偏高", "里程碑设置不够具体"],
      improvements: "细化每个季度的关键指标和里程碑"
    },
    {
      slideNumber: 10,
      highlight: "竞争分析覆盖面广",
      risks: ["差异化优势表述模糊", "护城河深度不够"],
      improvements: "量化核心竞争优势，展示具体的壁垒建设计划"
    },
    {
      slideNumber: 11,
      highlight: "Go-to-market策略清晰",
      risks: ["用户获取渠道过于单一", "转化率假设缺乏验证"],
      improvements: "多元化获客渠道，提供转化率的验证数据"
    },
    {
      slideNumber: 12,
      highlight: "退出策略考虑周全",
      risks: ["估值预期与市场现实存在差距", "时间线过于乐观"],
      improvements: "基于可比公司调整估值预期，制定更现实的时间规划"
    }
  ];

  // Customize based on investor type
  if (investorType === 'mentor') {
    return baseAnalysis.map(slide => ({
      ...slide,
      improvements: `【班主任建议】${slide.improvements}，建议制定具体的执行时间表`
    }));
  }

  return baseAnalysis;
};

const generateMockAnalysis = (fileName: string, investorType: InvestorType): GeminiAnalysis => {
  const investorContext = investorPrompts[investorType];
  
  return {
    overallScore: Math.floor(Math.random() * 30) + 70,
    metrics: generateDynamicMetrics(),
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
    slideAnalysis: generateMockSlideAnalysis(investorType)
  };
};
