
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
    console.log('🚀 usePitchAnalysis.analyzeFile - STARTING ANALYSIS');
    console.log('🚀 usePitchAnalysis.analyzeFile - File name:', file.name);
    console.log('🚀 usePitchAnalysis.analyzeFile - File type:', file.type);
    console.log('🚀 usePitchAnalysis.analyzeFile - File size:', file.size);
    console.log('🚀 usePitchAnalysis.analyzeFile - Investor type:', investorType);
    
    try {
      // Parse the actual slides from the file
      console.log('🔍 usePitchAnalysis.analyzeFile - Step 1: Starting slide parsing...');
      const actualSlides = await SlideParser.parseFile(file);
      console.log('🎯 usePitchAnalysis.analyzeFile - Step 1: SLIDE PARSING COMPLETE!');
      console.log('🎯 usePitchAnalysis.analyzeFile - actualSlides.length:', actualSlides.length);
      console.log('🎯 usePitchAnalysis.analyzeFile - actualSlides preview:', actualSlides.map(s => ({
        slideNumber: s.slideNumber,
        hasImage: !!s.imageUrl,
        imageLength: s.imageUrl?.length || 0
      })));
      
      // Add realistic delay for better UX
      console.log('🔍 usePitchAnalysis.analyzeFile - Step 2: Adding UX delay...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('🔍 usePitchAnalysis.analyzeFile - Step 3: Starting Gemini analysis...');
      const geminiAnalysis = await analyzePitchWithGemini(file.name, investorType);
      console.log('✅ usePitchAnalysis.analyzeFile - Step 3: Gemini analysis complete');
      
      const analysisWithFile: AnalysisData = {
        ...geminiAnalysis,
        fileName: file.name,
        investorType,
        actualSlides
      };
      
      console.log('🎉 usePitchAnalysis.analyzeFile - FINAL ANALYSIS DATA:');
      console.log('🎉 usePitchAnalysis.analyzeFile - fileName:', analysisWithFile.fileName);
      console.log('🎉 usePitchAnalysis.analyzeFile - investorType:', analysisWithFile.investorType);
      console.log('🎉 usePitchAnalysis.analyzeFile - actualSlides count:', analysisWithFile.actualSlides?.length || 0);
      console.log('🎉 usePitchAnalysis.analyzeFile - slideAnalysis count:', analysisWithFile.slideAnalysis?.length || 0);
      
      setAnalysisData(analysisWithFile);
    } catch (error) {
      console.error('💥 usePitchAnalysis.analyzeFile - ERROR during slide parsing:', error);
      console.error('💥 usePitchAnalysis.analyzeFile - Error name:', error.name);
      console.error('💥 usePitchAnalysis.analyzeFile - Error message:', error.message);
      
      // Fallback to analysis without actual slides
      try {
        console.log('🔄 usePitchAnalysis.analyzeFile - Attempting fallback (Gemini only)...');
        const geminiAnalysis = await analyzePitchWithGemini(file.name, investorType);
        const analysisWithFile: AnalysisData = {
          ...geminiAnalysis,
          fileName: file.name,
          investorType
        };
        console.log('✅ usePitchAnalysis.analyzeFile - Fallback successful');
        setAnalysisData(analysisWithFile);
      } catch (fallbackError) {
        console.error('💥 usePitchAnalysis.analyzeFile - Fallback analysis ALSO failed:', fallbackError);
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
