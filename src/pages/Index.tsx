
import React from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import LoadingState from '@/components/LoadingState';
import AnalysisResults from '@/components/AnalysisResults';
import InvestorSelector from '@/components/InvestorSelector';
import { usePitchAnalysis } from '@/hooks/usePitchAnalysis';
import { Button } from '@/components/ui/button';
import { InvestorType } from '@/services/geminiService';

const Index = () => {
  const { 
    isAnalyzing, 
    analysisData, 
    selectedInvestorType,
    analyzeFile, 
    resetAnalysis, 
    switchInvestorType,
    setSelectedInvestorType 
  } = usePitchAnalysis();

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
    analyzeFile(file, selectedInvestorType);
  };

  const handleInvestorTypeChange = (newType: InvestorType) => {
    if (analysisData) {
      // If we have analysis data, switch and re-analyze
      switchInvestorType(newType);
    } else {
      // If no analysis yet, just update the selection
      setSelectedInvestorType(newType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-20">
        {!isAnalyzing && !analysisData && (
          <div className="text-center space-y-12 sm:space-y-16 animate-fade-in">
            <div className="space-y-6 sm:space-y-8">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extralight text-gray-900 tracking-tight leading-tight">
                Perfect Your
                <br />
                <span className="text-blue-600">Pitch</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed px-4">
                Get AI-powered insights to analyze your pitch deck and improve your presentation
              </p>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8 px-4">
              <InvestorSelector 
                selectedType={selectedInvestorType}
                onTypeChange={handleInvestorTypeChange}
                isAnalyzing={isAnalyzing}
              />
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        )}

        {isAnalyzing && <LoadingState />}

        {analysisData && (
          <div className="space-y-6 sm:space-y-8">
            <div className="flex justify-center pb-6 sm:pb-8">
              <Button 
                onClick={resetAnalysis}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base font-medium"
              >
                Analyze Another Deck
              </Button>
            </div>
            
            <div className="max-w-5xl mx-auto mb-6 sm:mb-8 px-4">
              <InvestorSelector 
                selectedType={analysisData.investorType}
                onTypeChange={handleInvestorTypeChange}
                isAnalyzing={isAnalyzing}
              />
            </div>
            
            <AnalysisResults data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
