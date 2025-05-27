
import { useState } from 'react';

interface AnalysisData {
  overallScore: number;
  fileName: string;
  metrics: {
    clarity: number;
    market: number;
    team: number;
    traction: number;
    financial: number;
  };
  insights: string[];
  recommendations: string[];
}

export const usePitchAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const analyzeFile = async (file: File): Promise<void> => {
    setIsAnalyzing(true);
    console.log('Starting analysis for file:', file.name);
    
    // Simulate API call with realistic delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate realistic analysis data
    const mockData: AnalysisData = {
      overallScore: Math.floor(Math.random() * 40) + 60, // 60-100 range
      fileName: file.name,
      metrics: {
        clarity: Math.floor(Math.random() * 30) + 70,
        market: Math.floor(Math.random() * 40) + 50,
        team: Math.floor(Math.random() * 35) + 65,
        traction: Math.floor(Math.random() * 50) + 40,
        financial: Math.floor(Math.random() * 45) + 55,
      },
      insights: [
        "Strong problem statement clearly articulates market pain points",
        "Solution demonstrates clear competitive advantages",
        "Business model shows scalability potential",
        "Team composition aligns well with problem domain",
        "Market size validation could be strengthened with more data"
      ],
      recommendations: [
        "Add more specific traction metrics and growth rates to strengthen credibility",
        "Include clearer go-to-market strategy with customer acquisition costs",
        "Provide more detailed financial projections with realistic assumptions",
        "Highlight unique defensibility and competitive moats more prominently",
        "Consider adding customer testimonials or case studies for social proof"
      ]
    };
    
    console.log('Analysis completed:', mockData);
    setAnalysisData(mockData);
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setAnalysisData(null);
    setIsAnalyzing(false);
  };

  return {
    isAnalyzing,
    analysisData,
    analyzeFile,
    resetAnalysis
  };
};
