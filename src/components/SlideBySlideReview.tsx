
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, ArrowRight, User, Users, GraduationCap } from 'lucide-react';
import { InvestorType } from '@/services/geminiService';
import { SlideData } from '@/services/slideParser';
import PPTPreview from './PPTPreview';

interface SlideAnalysis {
  slideNumber: number;
  highlight: string;
  risks: string[];
  improvements: string;
}

interface SlideBySlideReviewProps {
  slideAnalysis: SlideAnalysis[];
  fileName: string;
  investorType: InvestorType;
  actualSlides?: SlideData[];
}

const SlideBySlideReview: React.FC<SlideBySlideReviewProps> = ({ 
  slideAnalysis, 
  fileName, 
  investorType,
  actualSlides 
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slideAnalysis.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
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

  const InvestorIcon = getInvestorIcon(investorType);
  const currentAnalysis = slideAnalysis[currentSlide];

  if (!currentAnalysis) {
    console.log('No current analysis found, slideAnalysis:', slideAnalysis, 'currentSlide:', currentSlide);
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">无法加载幻灯片分析数据</p>
      </div>
    );
  }

  // Get the actual slide data if available
  const actualSlide = actualSlides?.find(slide => slide.slideNumber === currentAnalysis.slideNumber);
  const slideImageUrl = actualSlide?.imageUrl;
  const pdfUrl = actualSlide?.pdfUrl;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900">逐页点评</h2>
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
            <InvestorIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm text-gray-600">{getInvestorTitle(investorType)}</span>
          </div>
        </div>
        <p className="text-gray-500 text-sm sm:text-base truncate px-4">{fileName}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Side - Slide Preview */}
        <PPTPreview 
          slideNumber={currentAnalysis.slideNumber}
          fileName={fileName}
          slideImageUrl={slideImageUrl}
          pdfUrl={pdfUrl}
          className="min-h-[400px] sm:min-h-[500px] lg:min-h-[600px]"
        />

        {/* Right Side - Analysis Feedback */}
        <Card className="p-4 sm:p-6 lg:p-8 bg-white border-0 shadow-xl rounded-xl">
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900">
                第 {currentAnalysis.slideNumber} 页 分析
              </h3>
              <div className="text-sm text-gray-500">
                {currentSlide + 1} / {slideAnalysis.length}
              </div>
            </div>

            {/* Highlight */}
            <div className="bg-emerald-50 rounded-xl p-4 sm:p-6 border border-emerald-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-emerald-900 mb-2">✓ 本页亮点</h4>
                  <p className="text-emerald-800 leading-relaxed text-sm sm:text-base">{currentAnalysis.highlight}</p>
                </div>
              </div>
            </div>

            {/* Risks */}
            <div className="bg-red-50 rounded-xl p-4 sm:p-6 border border-red-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-3">
                    {investorType === 'mentor' ? '⚠️ 需要注意的问题' : '⚠️ 致命隐患/逻辑漏洞'}
                  </h4>
                  <div className="space-y-2">
                    {currentAnalysis.risks && currentAnalysis.risks.length > 0 ? (
                      currentAnalysis.risks.map((risk, index) => (
                        <div key={index} className="flex items-start space-x-2">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-red-800 leading-relaxed text-sm sm:text-base">{risk}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-red-800 leading-relaxed text-sm sm:text-base">暂无风险分析</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-blue-50 rounded-xl p-4 sm:p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">
                    {investorType === 'mentor' ? '📚 班主任建议' : '▶️ 改进建议'}
                  </h4>
                  <p className="text-blue-800 leading-relaxed text-sm sm:text-base">{currentAnalysis.improvements}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="outline"
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>上一页</span>
        </Button>

        <div className="flex space-x-2">
          {slideAnalysis.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide
                  ? 'bg-blue-600 scale-125'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={nextSlide}
          disabled={currentSlide === slideAnalysis.length - 1}
          variant="outline"
          className="flex items-center space-x-2 w-full sm:w-auto"
        >
          <span>下一页</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SlideBySlideReview;
