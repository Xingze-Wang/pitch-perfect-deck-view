
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
  strengths?: string[];
  weaknesses?: string[];
}

interface AnalysisResultsProps {
  data: AnalysisData;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'bg-blue-50 border-blue-200';
    if (score >= 50) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const metricLabels = {
    clarity: 'Clarity & Messaging',
    market: 'Market Opportunity', 
    team: 'Team Strength',
    traction: 'Traction & Validation',
    financial: 'Financial Model'
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overall Score */}
      <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-light text-gray-900">Analysis Complete</h2>
          <div className={`px-6 py-3 rounded-2xl border-2 ${getScoreBg(data.overallScore)}`}>
            <span className={`text-2xl font-semibold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}/100
            </span>
          </div>
        </div>
        <p className="text-gray-500 text-lg font-light mb-6">{data.fileName}</p>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-700">Overall Score</span>
            <span className={`text-xl font-semibold ${getScoreColor(data.overallScore)}`}>
              {data.overallScore}%
            </span>
          </div>
          <Progress value={data.overallScore} className="h-3 bg-gray-100" />
        </div>
      </Card>

      {/* Detailed Metrics */}
      <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <h3 className="text-2xl font-light text-gray-900 mb-8">Detailed Breakdown</h3>
        <div className="grid gap-6">
          {Object.entries(data.metrics).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl">
              <span className="text-base font-medium text-gray-700 min-w-0 flex-1">
                {metricLabels[key as keyof typeof metricLabels]}
              </span>
              <div className="flex items-center space-x-4 flex-1 ml-6">
                <Progress value={value} className="flex-1 h-3 bg-gray-200" />
                <span className={`text-base font-semibold w-16 text-right ${getScoreColor(value)}`}>
                  {value}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths & Weaknesses */}
      {(data.strengths || data.weaknesses) && (
        <div className="grid md:grid-cols-2 gap-8">
          {data.strengths && (
            <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-2xl font-light text-gray-900 mb-6">Key Strengths</h3>
              <div className="space-y-4">
                {data.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-emerald-50/50 rounded-xl">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-light">{strength}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {data.weaknesses && (
            <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-2xl font-light text-gray-900 mb-6">Areas to Improve</h3>
              <div className="space-y-4">
                {data.weaknesses.map((weakness, index) => (
                  <div key={index} className="flex items-start space-x-3 p-4 bg-red-50/50 rounded-xl">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 font-light">{weakness}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* AI Insights */}
      <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <h3 className="text-2xl font-light text-gray-900 mb-6">AI Insights</h3>
        <div className="space-y-4">
          {data.insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-4 p-4 bg-blue-50/50 rounded-xl">
              <div className="w-3 h-3 bg-blue-500 rounded-full mt-1 flex-shrink-0"></div>
              <span className="text-gray-700 font-light leading-relaxed">{insight}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
        <h3 className="text-2xl font-light text-gray-900 mb-6">Recommendations</h3>
        <div className="space-y-4">
          {data.recommendations.map((recommendation, index) => (
            <div key={index} className="p-6 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-xl border border-blue-100/50">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700 font-light leading-relaxed">{recommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AnalysisResults;
