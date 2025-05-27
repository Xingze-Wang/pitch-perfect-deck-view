
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

interface SlideAnalysis {
  slideNumber: number;
  highlight: string;
  risks: string[];
  improvements: string;
}

interface SlideBySlideReviewProps {
  slideAnalysis: SlideAnalysis[];
  fileName: string;
}

const SlideBySlideReview: React.FC<SlideBySlideReviewProps> = ({ slideAnalysis, fileName }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => Math.min(prev + 1, slideAnalysis.length - 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => Math.max(prev - 1, 0));
  };

  const currentAnalysis = slideAnalysis[currentSlide];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-light text-gray-900 mb-2">金沙江创投 逐页点评</h2>
        <p className="text-gray-500">{fileName}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 min-h-[600px]">
        {/* Left Side - Slide Preview */}
        <Card className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 border-0 shadow-xl flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-32 h-24 mx-auto bg-white rounded-lg shadow-md flex items-center justify-center border-2 border-gray-200">
              <span className="text-2xl font-light text-gray-600">
                第 {currentAnalysis?.slideNumber} 页
              </span>
            </div>
            <p className="text-sm text-gray-500">
              在此处您可以看到实际的幻灯片内容
            </p>
          </div>
        </Card>

        {/* Right Side - VC Feedback */}
        <Card className="p-8 bg-white border-0 shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-medium text-gray-900">
                第 {currentAnalysis?.slideNumber} 页 分析
              </h3>
              <div className="text-sm text-gray-500">
                {currentSlide + 1} / {slideAnalysis.length}
              </div>
            </div>

            {/* Highlight */}
            <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-emerald-900 mb-2">✓ 本页亮点</h4>
                  <p className="text-emerald-800 leading-relaxed">{currentAnalysis?.highlight}</p>
                </div>
              </div>
            </div>

            {/* Risks */}
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-red-900 mb-3">⚠️ 致命隐患/逻辑漏洞</h4>
                  <div className="space-y-2">
                    {currentAnalysis?.risks.map((risk, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-red-800 leading-relaxed">{risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Improvements */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start space-x-3">
                <ArrowRight className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">▶️ 改进建议</h4>
                  <p className="text-blue-800 leading-relaxed">{currentAnalysis?.improvements}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Navigation */}
      <div className="flex justify-center items-center space-x-4">
        <Button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          variant="outline"
          className="flex items-center space-x-2"
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
          className="flex items-center space-x-2"
        >
          <span>下一页</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default SlideBySlideReview;
