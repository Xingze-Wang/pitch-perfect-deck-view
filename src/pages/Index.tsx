
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {!isAnalyzing && !analysisData && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Get YC-Style Feedback on Your Pitch
              </h2>
              <p className="text-lg text-yc-gray max-w-2xl mx-auto">
                Upload your pitch deck and receive detailed analysis based on Y Combinator's 
                proven methodology for evaluating startup presentations.
              </p>
            </div>
            
            <FileUpload onFileSelect={handleFileSelect} />
            
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                What we analyze:
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yc-orange rounded-full"></div>
                    <span className="text-yc-gray">Problem-solution fit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yc-orange rounded-full"></div>
                    <span className="text-yc-gray">Market size and opportunity</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yc-orange rounded-full"></div>
                    <span className="text-yc-gray">Business model viability</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yc-orange rounded-full"></div>
                    <span className="text-yc-gray">Team composition and expertise</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yc-orange rounded-full"></div>
                    <span className="text-yc-gray">Traction and growth metrics</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yc-orange rounded-full"></div>
                    <span className="text-yc-gray">Financial projections</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isAnalyzing && <LoadingState />}

        {analysisData && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
              <Button 
                onClick={resetAnalysis}
                variant="outline"
                className="border-yc-orange text-yc-orange hover:bg-yc-orange hover:text-white"
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
