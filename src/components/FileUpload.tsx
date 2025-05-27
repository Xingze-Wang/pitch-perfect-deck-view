
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [onFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileSelect(files[0]);
    }
  };

  return (
    <Card className={`p-12 border-2 border-dashed transition-all duration-300 cursor-pointer hover:shadow-lg ${
      isDragOver 
        ? 'border-brand-blue bg-blue-50 shadow-lg' 
        : 'border-gray-200 hover:border-brand-blue'
    }`}>
      <div
        className="text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="w-16 h-16 mx-auto mb-6 bg-gray-50 rounded-full flex items-center justify-center">
          <Upload className="w-8 h-8 text-gray-400" />
        </div>
        
        <input
          type="file"
          accept=".pdf,.ppt,.pptx"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        
        <label
          htmlFor="file-upload"
          className="block"
        >
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900">
              Drop your deck here
            </h3>
            <div className="inline-block bg-brand-blue text-white px-8 py-3 rounded-lg font-medium hover:bg-brand-darkblue transition-colors cursor-pointer">
              Choose File
            </div>
          </div>
        </label>
      </div>
    </Card>
  );
};

export default FileUpload;
