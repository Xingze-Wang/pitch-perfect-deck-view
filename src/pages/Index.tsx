
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-6xl mx-auto px-6 py-20">
        {!isAnalyzing && !analysisData && (
          <div className="text-center space-y-16 animate-fade-in">
            <div className="space-y-8">
              <h1 className="text-6xl font-extralight text-gray-900 tracking-tight leading-tight">
                Perfect Your
                <br />
                <span className="text-blue-600">Pitch</span>
              </h1>
              <p className="text-xl text-gray-500 font-light max-w-lg mx-auto leading-relaxed">
                Get AI-powered insights to analyze your pitch deck and improve your presentation
              </p>
            </div>
            
            <div className="max-w-lg mx-auto space-y-8">
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
          <div className="space-y-8">
            <div className="flex justify-center pb-8">
              <Button 
                onClick={resetAnalysis}
                variant="outline"
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 px-8 py-3 text-base font-medium"
              >
                Analyze Another Deck
              </Button>
            </div>
            
            <div className="max-w-4xl mx-auto mb-8">
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
