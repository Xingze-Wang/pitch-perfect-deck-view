
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { User, Users, GraduationCap } from 'lucide-react';
import { InvestorType } from '@/services/geminiService';

interface InvestorSelectorProps {
  selectedType: InvestorType;
  onTypeChange: (type: InvestorType) => void;
  isAnalyzing: boolean;
}

const investorTypes = [
  {
    type: 'vc' as InvestorType,
    title: '风投合伙人',
    description: '专业VC视角，关注规模化和商业模式',
    icon: Users,
    color: 'bg-blue-500'
  },
  {
    type: 'angel' as InvestorType,
    title: '天使投资人',
    description: '早期投资视角，关注团队和产品创新',
    icon: User,
    color: 'bg-green-500'
  },
  {
    type: 'mentor' as InvestorType,
    title: '创业班主任',
    description: '导师视角，提供实用建议和成长指导',
    icon: GraduationCap,
    color: 'bg-purple-500'
  }
];

const InvestorSelector: React.FC<InvestorSelectorProps> = ({ 
  selectedType, 
  onTypeChange, 
  isAnalyzing 
}) => {
  return (
    <Card className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <h3 className="text-xl font-medium text-gray-900 mb-4 text-center">
        选择评估视角
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {investorTypes.map((investor) => {
          const Icon = investor.icon;
          const isSelected = selectedType === investor.type;
          
          return (
            <Button
              key={investor.type}
              onClick={() => onTypeChange(investor.type)}
              disabled={isAnalyzing}
              variant={isSelected ? 'default' : 'outline'}
              className={`p-4 h-auto flex flex-col items-center space-y-3 transition-all duration-200 ${
                isSelected 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600' 
                  : 'hover:bg-gray-50 border-gray-200'
              }`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isSelected ? 'bg-white/20' : investor.color
              }`}>
                <Icon className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-white'}`} />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{investor.title}</div>
                <div className={`text-xs mt-1 ${
                  isSelected ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {investor.description}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};

export default InvestorSelector;
