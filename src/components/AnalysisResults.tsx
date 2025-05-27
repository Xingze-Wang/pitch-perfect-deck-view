
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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

interface AnalysisResultsProps {
  data: AnalysisData;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yc-orange';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Overall Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Analysis Results</h2>
          <div className={`px-3 py-1 rounded-full ${getScoreBg(data.overallScore)}`}>
            <span className={`text-sm font-medium ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}/100
            </span>
          </div>
        </div>
        <p className="text-yc-gray text-sm mb-4">File: {data.fileName}</p>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Score</span>
            <span className={`font-semibold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}%
            </span>
          </div>
          <Progress value={data.overallScore} className="h-3" />
        </div>
      </Card>

      {/* Detailed Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(data.metrics).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 capitalize">
                {key === 'financial' ? 'Financials' : key}
              </span>
              <div className="flex items-center space-x-3 flex-1 ml-4">
                <Progress value={value} className="flex-1 h-2" />
                <span className={`text-sm font-medium w-12 ${getScoreColor(value)}`}>
                  {value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Key Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <ul className="space-y-2">
          {data.insights.map((insight, index) => (
            <li key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-yc-orange rounded-full mt-2 flex-shrink-0"></div>
              <span className="text-yc-gray text-sm">{insight}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">YC-Style Recommendations</h3>
        <div className="space-y-3">
          {data.recommendations.map((recommendation, index) => (
            <div key={index} className="p-3 bg-yc-lightgray rounded-lg">
              <p className="text-sm text-yc-darkgray">{recommendation}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalysisResults;
