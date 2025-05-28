
import { useState } from 'react';
import { analyzePitchWithGemini, GeminiAnalysis, InvestorType } from '@/services/geminiService';

interface AnalysisData extends GeminiAnalysis {
  fileName: string;
  investorType: InvestorType;
}

export const usePitchAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedInvestorType, setSelectedInvestorType] = useState<InvestorType>('vc');

  const analyzeFile = async (file: File, investorType: InvestorType = selectedInvestorType): Promise<void> => {
    setIsAnalyzing(true);
    console.log('Starting Gemini analysis for file:', file.name, 'with investor type:', investorType);
    
    try {
      // Add realistic delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const geminiAnalysis = await analyzePitchWithGemini(file.name, investorType);
      
      const analysisWithFile: AnalysisData = {
        ...geminiAnalysis,
        fileName: file.name,
        investorType
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

  const switchInvestorType = async (newInvestorType: InvestorType) => {
    if (analysisData && newInvestorType !== analysisData.investorType) {
      setSelectedInvestorType(newInvestorType);
      // Re-analyze with new investor type
      const mockFile = new File([''], analysisData.fileName);
      await analyzeFile(mockFile, newInvestorType);
    }
  };

  return {
    isAnalyzing,
    analysisData,
    selectedInvestorType,
    analyzeFile,
    resetAnalysis,
    switchInvestorType,
    setSelectedInvestorType
  };
};
