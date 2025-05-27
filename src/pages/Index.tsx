
import React from 'react';
import Header from '@/components/Header';
import FileUpload from '@/components/FileUpload';
import LoadingState from '@/components/LoadingState';
import AnalysisResults from '@/components/AnalysisResults';
import { usePitchAnalysis } from '@/hooks/usePitchAnalysis';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { isAnalyzing, analysisData, analyzeFile, resetAnalysis } = usePitchAnalysis();

  const handleFileSelect = (file: File) => {
    console.log('File selected:', file.name);
    analyzeFile(file);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="max-w-3xl mx-auto px-6 py-16">
        {!isAnalyzing && !analysisData && (
          <div className="text-center space-y-12 animate-fade-in">
            <div className="space-y-6">
              <h1 className="text-5xl font-light text-gray-900 tracking-tight">
                Perfect Your Pitch
              </h1>
              <p className="text-xl text-gray-600 font-light max-w-lg mx-auto">
                Get instant feedback on your startup presentation
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <FileUpload onFileSelect={handleFileSelect} />
            </div>
          </div>
        )}

        {isAnalyzing && <LoadingState />}

        {analysisData && (
          <div className="space-y-8">
            <div className="flex justify-center">
              <Button 
                onClick={resetAnalysis}
                variant="outline"
                className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
              >
                Analyze Another Deck
              </Button>
            </div>
            <AnalysisResults data={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
