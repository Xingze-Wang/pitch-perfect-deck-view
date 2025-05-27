
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
    <Card className={`p-16 border-2 border-dashed transition-all duration-300 cursor-pointer group ${
      isDragOver 
        ? 'border-blue-500 bg-blue-50/50 shadow-xl scale-105' 
        : 'border-gray-200 hover:border-blue-400 hover:shadow-lg hover:scale-102'
    } bg-white/70 backdrop-blur-sm`}>
      <div
        className="text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className={`w-20 h-20 mx-auto mb-8 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          isDragOver ? 'bg-blue-100' : 'bg-gray-50 group-hover:bg-blue-50'
        }`}>
          <Upload className={`w-10 h-10 transition-colors duration-300 ${
            isDragOver ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
          }`} />
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
          className="block cursor-pointer"
        >
          <div className="space-y-6">
            <h3 className="text-2xl font-light text-gray-900">
              Drop your deck here
            </h3>
            <p className="text-gray-500 font-light">
              PDF, PPT, or PPTX files
            </p>
            <div className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Choose File
            </div>
          </div>
        </label>
      </div>
    </Card>
  );
};

export default FileUpload;
