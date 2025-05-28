
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, User, Users, GraduationCap } from 'lucide-react';
import SlideBySlideReview from './SlideBySlideReview';
import { InvestorType } from '@/services/geminiService';
import { SlideData } from '@/services/slideParser';

interface SlideAnalysis {
  slideNumber: number;
  highlight: string;
  risks: string[];
  improvements: string;
}

interface AnalysisData {
  overallScore: number;
  fileName: string;
  investorType: InvestorType;
  actualSlides?: SlideData[];
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
  slideAnalysis: SlideAnalysis[];
}

interface AnalysisResultsProps {
  data: AnalysisData;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ data }) => {
  const [viewMode, setViewMode] = useState<'overview' | 'slides'>('slides');

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
    clarity: '表达清晰度',
    market: '市场机会', 
    team: '团队实力',
    traction: '牵引力验证',
    financial: '财务模型'
  };

  const getInvestorIcon = (type: InvestorType) => {
    switch (type) {
      case 'vc': return Users;
      case 'angel': return User;
      case 'mentor': return GraduationCap;
      default: return Users;
    }
  };

  const getInvestorTitle = (type: InvestorType) => {
    switch (type) {
      case 'vc': return '风投合伙人';
      case 'angel': return '天使投资人';
      case 'mentor': return '创业班主任';
      default: return '风投合伙人';
    }
  };

  const InvestorIcon = getInvestorIcon(data.investorType);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Horizontal View Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-white rounded-xl p-1 shadow-lg border flex">
          <Button
            onClick={() => setViewMode('slides')}
            variant={viewMode === 'slides' ? 'default' : 'ghost'}
            className="flex items-center space-x-2 px-6 py-3"
          >
            <FileText className="w-4 h-4" />
            <span>逐页点评</span>
          </Button>
          <Button
            onClick={() => setViewMode('overview')}
            variant={viewMode === 'overview' ? 'default' : 'ghost'}
            className="flex items-center space-x-2 px-6 py-3"
          >
            <BarChart3 className="w-4 h-4" />
            <span>总体分析</span>
          </Button>
        </div>
      </div>

      {viewMode === 'slides' ? (
        <SlideBySlideReview 
          slideAnalysis={data.slideAnalysis} 
          fileName={data.fileName} 
          investorType={data.investorType}
          actualSlides={data.actualSlides}
        />
      ) : (
        <div className="space-y-8">
          {/* Overall Score */}
          <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <h2 className="text-3xl font-light text-gray-900">总体评估</h2>
                <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
                  <InvestorIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-gray-600">{getInvestorTitle(data.investorType)}</span>
                </div>
              </div>
              <div className={`px-6 py-3 rounded-2xl border-2 ${getScoreBg(data.overallScore)}`}>
                <span className={`text-2xl font-semibold ${getScoreColor(data.overallScore)}`}>
                  {data.overallScore}/100
                </span>
              </div>
            </div>
            <p className="text-gray-500 text-lg font-light mb-6">{data.fileName}</p>
            
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium text-gray-700">综合评分</span>
                <span className={`text-xl font-semibold ${getScoreColor(data.overallScore)}`}>
                  {data.overallScore}%
                </span>
              </div>
              <Progress value={data.overallScore} className="h-3 bg-gray-100" />
            </div>
          </Card>

          {/* Detailed Metrics */}
          <Card className="p-8 bg-white/70 backdrop-blur-sm border-0 shadow-xl">
            <h3 className="text-2xl font-light text-gray-900 mb-8">各维度评分</h3>
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
                  <h3 className="text-2xl font-light text-gray-900 mb-6">核心优势</h3>
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
                  <h3 className="text-2xl font-light text-gray-900 mb-6">待改进点</h3>
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
            <h3 className="text-2xl font-light text-gray-900 mb-6">投资洞察</h3>
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
            <h3 className="text-2xl font-light text-gray-900 mb-6">改进建议</h3>
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
      )}
    </div>
  );
};

export default AnalysisResults;
