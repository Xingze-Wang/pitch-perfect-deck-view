
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
    reliability: number;    // 靠谱
    confidence: number;     // 自信
    market: number;         // 市场
    team: number;          // 团队
    cognition: number;     // 认知
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
- 市场规模和增长潜力（TAM/SAM/SOM分析）
- 商业模式的可扩展性和盈利能力
- 团队的执行能力和track record
- 竞争壁垒和护城河的深度
- 财务模型和关键指标的健康度
- 退出策略和估值合理性

【评分标准】
80分以上：强烈推荐投资，符合基金投资标准
70-79分：有投资价值但需要进一步尽调
60-69分：存在较大风险，需要重大改进
60分以下：不建议投资
`
  },
  angel: {
    title: '天使投资人',
    prompt: `
【角色设定】
你是一位经验丰富的天使投资人，曾是成功的连续创业者，现在专注于早期项目投资。你更关注创始人的潜力、市场时机和产品创新性。你的投资风格相对宽松，更看重团队和市场机会。

【评估重点】
- 创始人的背景、执行力和学习能力
- 产品的创新性和用户价值主张
- 市场时机和早期牵引力证据
- 团队配置的互补性
- 早期用户反馈和产品迭代能力
- 解决真实痛点的程度

【评分标准】
70分以上：值得天使投资，看好长期潜力
60-69分：有潜力但需要观察
50-59分：风险较高，需要大幅改进
50分以下：不适合天使投资
`
  },
  mentor: {
    title: '创业班主任',
    prompt: `
【角色设定】
你是创业加速器的资深导师，被称为"创业班主任"。你见过无数创业项目的成功与失败，擅长给出实用的建议和改进方向。你的评价风格温和而建设性，重点是帮助创业者成长和学习。

【评估重点】
- 如何优化pitch的表达方式和逻辑
- 具体的改进建议和可执行的行动计划
- 常见的创业陷阱和如何避免
- 下一步的具体执行步骤和里程碑
- 团队能力提升和学习规划
- 如何更好地验证商业假设

【评分标准】
重点不在绝对分数，而在成长潜力和学习能力
给出建设性的分数，通常在60-85分之间
重点关注改进空间和具体建议
`
  }
};

export const analyzePitchWithGemini = async (fileName: string, investorType: InvestorType = 'vc'): Promise<GeminiAnalysis> => {
  const investor = investorPrompts[investorType];
  const timestamp = Date.now();
  const randomSeed = Math.random().toString(36).substring(7);
  
  const prompt = `
${investor.prompt}

【当前分析任务】
文件名：${fileName}
投资人类型：${investor.title}
分析时间：${new Date().toLocaleString('zh-CN')}
随机种子：${randomSeed}

请基于上述信息，模拟分析一个真实的创业公司pitch deck。请生成完全不同的、个性化的反馈内容。每次分析都应该反映不同的项目特点、不同的问题和机会。

【重要要求】
1. 请确保每次生成的内容都完全不同，包括评分、优缺点、建议等
2. 评分要真实反映${investor.title}的投资标准和风险偏好
3. 根据文件名推测可能的行业和商业模式，给出针对性分析
4. 生成的内容要具体、可执行，避免空泛的建议
5. 请务必使用真实、变化的评分，不要使用固定数值

【评分维度说明】
- reliability (靠谱): 项目的可行性、执行能力、风险控制 (请给出30-95之间的真实评分)
- confidence (自信): 创始人和团队的表达自信度、对项目的信心 (请给出30-95之间的真实评分)
- market (市场): 市场机会、竞争分析、商业模式 (请给出30-95之间的真实评分)
- team (团队): 团队配置、背景、互补性 (请给出30-95之间的真实评分)
- cognition (认知): 对行业、用户、趋势的认知深度 (请给出30-95之间的真实评分)

【输出要求】
请直接以JSON格式回复，不要包含任何其他文字说明。确保overallScore是上述五个维度的合理平均值。

请确保每次分析都生成不同的、真实的评分，基于${investor.title}的专业视角。

{
  "overallScore": 请计算上述五个维度的平均值,
  "metrics": {
    "reliability": 请给出真实的30-95之间的评分,
    "confidence": 请给出真实的30-95之间的评分,
    "market": 请给出真实的30-95之间的评分,
    "team": 请给出真实的30-95之间的评分,
    "cognition": 请给出真实的30-95之间的评分
  },
  "insights": [
    "基于文件名分析的具体行业洞察",
    "针对该项目的独特市场机会分析",
    "符合当前投资趋势的战略价值"
  ],
  "recommendations": [
    "针对该项目的具体改进建议",
    "基于投资人类型的专业建议",
    "可执行的下一步行动计划"
  ],
  "strengths": [
    "该项目的核心竞争优势",
    "团队或产品的突出亮点"
  ],
  "weaknesses": [
    "需要改进的关键问题",
    "潜在的风险点"
  ],
  "slideAnalysis": [
    {
      "slideNumber": 1,
      "highlight": "针对该项目的具体亮点分析",
      "risks": ["具体的风险点1", "具体的风险点2"],
      "improvements": "具体的改进建议"
    },
    {
      "slideNumber": 2,
      "highlight": "第二页的独特分析",
      "risks": ["不同的风险分析", "新的关注点"],
      "improvements": "针对性的改进方案"
    },
    {
      "slideNumber": 3,
      "highlight": "商业模式的专业点评",
      "risks": ["商业模式相关风险", "盈利模式挑战"],
      "improvements": "商业模式优化建议"
    },
    {
      "slideNumber": 4,
      "highlight": "市场分析的专业评价",
      "risks": ["市场相关风险", "竞争环境挑战"],
      "improvements": "市场策略改进建议"
    },
    {
      "slideNumber": 5,
      "highlight": "产品功能的投资人视角",
      "risks": ["产品风险评估", "技术挑战"],
      "improvements": "产品优化方向"
    },
    {
      "slideNumber": 6,
      "highlight": "增长数据的专业解读",
      "risks": ["增长可持续性风险", "数据质量问题"],
      "improvements": "增长策略优化"
    },
    {
      "slideNumber": 7,
      "highlight": "团队评估的投资人观点",
      "risks": ["团队配置风险", "执行能力评估"],
      "improvements": "团队建设建议"
    },
    {
      "slideNumber": 8,
      "highlight": "财务模型的专业分析",
      "risks": ["财务假设风险", "盈利能力挑战"],
      "improvements": "财务策略建议"
    },
    {
      "slideNumber": 9,
      "highlight": "融资规划的投资人视角",
      "risks": ["资金使用效率风险", "里程碑设置问题"],
      "improvements": "融资策略优化"
    },
    {
      "slideNumber": 10,
      "highlight": "竞争分析的专业评价",
      "risks": ["竞争壁垒不足", "差异化不明显"],
      "improvements": "竞争策略建议"
    },
    {
      "slideNumber": 11,
      "highlight": "市场策略的投资人观点",
      "risks": ["获客成本风险", "渠道依赖问题"],
      "improvements": "GTM策略优化"
    },
    {
      "slideNumber": 12,
      "highlight": "退出策略的专业分析",
      "risks": ["估值预期风险", "退出时机不确定"],
      "improvements": "退出规划建议"
    }
  ]
}
`;

  try {
    console.log(`Calling Gemini API for ${investor.title} analysis with seed: ${randomSeed}...`);
    console.log('Prompt being sent to Gemini:', prompt.substring(0, 500) + '...');
    
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
          temperature: 0.95, // 增加随机性，确保每次都不同
          topK: 50,
          topP: 0.98,
          maxOutputTokens: 8192,
        }
      })
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error details:', errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw Gemini response received, checking structure...');
    
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!analysisText) {
      console.error('No analysis text in response:', data);
      throw new Error('No analysis text received from Gemini');
    }

    console.log('Analysis text from Gemini (first 200 chars):', analysisText.substring(0, 200));

    // Clean the text and extract JSON
    let cleanedText = analysisText.trim();
    
    // Remove any markdown formatting
    cleanedText = cleanedText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Find JSON content between braces
    const jsonStart = cleanedText.indexOf('{');
    const jsonEnd = cleanedText.lastIndexOf('}');
    
    if (jsonStart === -1 || jsonEnd === -1) {
      console.error('No valid JSON braces found in response');
      console.error('Full response text:', cleanedText);
      throw new Error('No valid JSON structure found in response');
    }
    
    const jsonText = cleanedText.substring(jsonStart, jsonEnd + 1);
    console.log('Extracted JSON text (first 300 chars):', jsonText.substring(0, 300));

    let analysis;
    try {
      analysis = JSON.parse(jsonText);
      console.log('Successfully parsed analysis from Gemini');
      console.log('Parsed scores:', {
        overall: analysis.overallScore,
        reliability: analysis.metrics?.reliability,
        confidence: analysis.metrics?.confidence,
        market: analysis.metrics?.market,
        team: analysis.metrics?.team,
        cognition: analysis.metrics?.cognition
      });
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
      console.error('Invalid overallScore in response:', analysis.overallScore);
      throw new Error('Invalid overallScore from Gemini');
    }
    
    if (!analysis.metrics || typeof analysis.metrics !== 'object') {
      console.error('Invalid metrics in response');
      throw new Error('Invalid metrics from Gemini');
    }
    
    // Ensure all required metric fields exist
    const requiredMetrics = ['reliability', 'confidence', 'market', 'team', 'cognition'];
    for (const metric of requiredMetrics) {
      if (typeof analysis.metrics[metric] !== 'number') {
        console.error(`Missing or invalid metric: ${metric}`, analysis.metrics[metric]);
        throw new Error(`Invalid metric: ${metric}`);
      }
    }
    
    console.log('Final analysis being returned:', {
      overallScore: analysis.overallScore,
      metrics: analysis.metrics,
      hasInsights: analysis.insights?.length || 0,
      hasRecommendations: analysis.recommendations?.length || 0,
      hasSlideAnalysis: analysis.slideAnalysis?.length || 0
    });
    
    return analysis;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
};
