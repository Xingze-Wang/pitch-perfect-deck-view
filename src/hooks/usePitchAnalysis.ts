
import { useState } from 'react';
import { analyzePitchWithGemini, GeminiAnalysis } from '@/services/geminiService';

interface AnalysisData extends GeminiAnalysis {
  fileName: string;
}

export const usePitchAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  const analyzeFile = async (file: File): Promise<void> => {
    setIsAnalyzing(true);
    console.log('Starting Gemini analysis for file:', file.name);
    
    try {
      // Add realistic delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const geminiAnalysis = await analyzePitchWithGemini(file.name);
      
      const analysisWithFile: AnalysisData = {
        ...geminiAnalysis,
        fileName: file.name
      };
      
      console.log('Analysis completed:', analysisWithFile);
      setAnalysisData(analysisWithFile);
    } catch (error) {
      console.error('Error during analysis:', error);
      // You could add error handling here with toast notifications
    } finally {
      setIsAnalyzing(false);
    }
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
