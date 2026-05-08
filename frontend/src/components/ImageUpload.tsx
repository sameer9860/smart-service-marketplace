"use client";

import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  initialImage?: string;
  onImageChange: (file: File | null) => void;
  label?: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'any';
}

export default function ImageUpload({ 
  initialImage, 
  onImageChange, 
  label = "Upload Image",
  className = "",
  aspectRatio = 'square'
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file.");
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Max 5MB allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    onImageChange(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const aspectClass = {
    square: 'aspect-square',
    video: 'aspect-video',
    any: 'min-h-[200px]'
  }[aspectRatio];

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="text-sm font-bold text-neutral-500 uppercase tracking-widest ml-1">{label}</label>}
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`
          relative group cursor-pointer overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-500
          ${preview ? 'border-transparent' : isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}
          ${aspectClass}
        `}
      >
        {preview ? (
          <>
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
               <div className="flex flex-col items-center gap-2">
                 <Camera className="w-8 h-8 text-white" />
                 <span className="text-white font-black text-xs uppercase tracking-widest">Change Photo</span>
               </div>
            </div>
            <button 
              onClick={clearImage}
              className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-xl hover:scale-110 active:scale-95 transition-all z-20"
            >
              <X className="w-4 h-4" />
            </button>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-neutral-800 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600/20 group-hover:text-blue-500 transition-all">
              <Upload className="w-8 h-8 text-neutral-500 group-hover:text-inherit" />
            </div>
            <div>
              <p className="text-white font-black tracking-tight">Drop your image here</p>
              <p className="text-neutral-500 text-xs font-medium mt-1">or click to browse files</p>
            </div>
            <div className="flex items-center gap-4 pt-2">
               <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">JPG</span>
               <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">PNG</span>
               <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 py-1 bg-white/5 rounded-md">WEBP</span>
            </div>
          </div>
        )}

        <input 
          type="file" 
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}
