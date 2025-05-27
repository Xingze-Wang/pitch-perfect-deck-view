
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';

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
    <Card className={`p-8 border-2 border-dashed transition-all duration-200 ${
      isDragOver 
        ? 'border-yc-orange bg-orange-50' 
        : 'border-gray-300 hover:border-yc-orange hover:bg-gray-50'
    }`}>
      <div
        className="text-center"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="w-16 h-16 mx-auto mb-4 bg-yc-lightgray rounded-lg flex items-center justify-center">
          <svg className="w-8 h-8 text-yc-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload your pitch deck
        </h3>
        <p className="text-yc-gray mb-4">
          Drag and drop your PDF, or click to browse
        </p>
        <input
          type="file"
          accept=".pdf,.ppt,.pptx"
          onChange={handleFileInput}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="inline-block bg-yc-orange text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors cursor-pointer"
        >
          Choose File
        </label>
        <p className="text-xs text-yc-gray mt-2">
          Supports PDF and PowerPoint files
        </p>
      </div>
    </Card>
  );
};

export default FileUpload;
