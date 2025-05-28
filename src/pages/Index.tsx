
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
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isAnalyzing && !analysisData && (
          <div className="py-12 sm:py-16 lg:py-20">
            <div className="text-center space-y-8 sm:space-y-12 animate-fade-in">
              {/* Hero Section */}
              <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extralight text-gray-900 tracking-tight leading-tight">
                  Perfect Your
                  <br />
                  <span className="text-blue-600">Pitch</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-gray-500 font-light max-w-2xl mx-auto leading-relaxed">
                  Get AI-powered insights to analyze your pitch deck and improve your presentation
                </p>
              </div>
              
              {/* Content Section */}
              <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
                <InvestorSelector 
                  selectedType={selectedInvestorType}
                  onTypeChange={handleInvestorTypeChange}
                  isAnalyzing={isAnalyzing}
                />
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="py-20">
            <LoadingState />
          </div>
        )}

        {analysisData && (
          <div className="py-8 space-y-8">
            <div className="flex justify-center">
              <Button 
                onClick={resetAnalysis}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 px-6 py-2 font-medium"
              >
                Analyze Another Deck
              </Button>
            </div>
            
            <div className="max-w-5xl mx-auto space-y-6">
              <InvestorSelector 
                selectedType={analysisData.investorType}
                onTypeChange={handleInvestorTypeChange}
                isAnalyzing={isAnalyzing}
              />
              <AnalysisResults data={analysisData} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
