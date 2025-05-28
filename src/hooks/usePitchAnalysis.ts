
import { useState } from 'react';
import { analyzePitchWithGemini, GeminiAnalysis, InvestorType } from '@/services/geminiService';
import { SlideParser, SlideData } from '@/services/slideParser';

interface AnalysisData extends GeminiAnalysis {
  fileName: string;
  investorType: InvestorType;
  actualSlides?: SlideData[];
}

export const usePitchAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [selectedInvestorType, setSelectedInvestorType] = useState<InvestorType>('vc');

  const analyzeFile = async (file: File, investorType: InvestorType = selectedInvestorType): Promise<void> => {
    setIsAnalyzing(true);
    console.log('Starting analysis for file:', file.name, 'with investor type:', investorType);
    
    try {
      // Parse the actual slides from the file
      console.log('Parsing slides from file...');
      const actualSlides = await SlideParser.parseFile(file);
      console.log('Parsed slides:', actualSlides.length);
      
      // Add realistic delay for better UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const geminiAnalysis = await analyzePitchWithGemini(file.name, investorType);
      
      const analysisWithFile: AnalysisData = {
        ...geminiAnalysis,
        fileName: file.name,
        investorType,
        actualSlides
      };
      
      console.log('Analysis completed:', analysisWithFile);
      setAnalysisData(analysisWithFile);
    } catch (error) {
      console.error('Error during analysis:', error);
      // Fallback to analysis without actual slides
      try {
        const geminiAnalysis = await analyzePitchWithGemini(file.name, investorType);
        const analysisWithFile: AnalysisData = {
          ...geminiAnalysis,
          fileName: file.name,
          investorType
        };
        setAnalysisData(analysisWithFile);
      } catch (fallbackError) {
        console.error('Fallback analysis also failed:', fallbackError);
      }
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
      
      setIsAnalyzing(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1500));
        const geminiAnalysis = await analyzePitchWithGemini(analysisData.fileName, newInvestorType);
        
        const updatedAnalysis: AnalysisData = {
          ...geminiAnalysis,
          fileName: analysisData.fileName,
          investorType: newInvestorType,
          actualSlides: analysisData.actualSlides // Keep the same parsed slides
        };
        
        setAnalysisData(updatedAnalysis);
      } catch (error) {
        console.error('Error switching investor type:', error);
      } finally {
        setIsAnalyzing(false);
      }
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
