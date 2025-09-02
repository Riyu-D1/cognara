import React, { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  Youtube, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  Video,
  X,
  Link,
  File
} from 'lucide-react';

interface ContentInputOptionsProps {
  onContentSelect: (type: 'youtube' | 'file', content: any) => void;
  acceptedTypes?: string[];
  className?: string;
}

export function ContentInputOptions({ 
  onContentSelect, 
  acceptedTypes = ['.pdf', '.docx', '.txt', '.jpg', '.png', '.mp4', '.mp3'],
  className = ""
}: ContentInputOptionsProps) {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleYoutubeSubmit = () => {
    if (youtubeUrl.trim()) {
      onContentSelect('youtube', { url: youtubeUrl.trim() });
      setYoutubeUrl('');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
      onContentSelect('file', { files });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      onContentSelect('file', { files });
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    if (updatedFiles.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
      case 'doc':
      case 'docx':
      case 'txt':
        return <FileText className="w-4 h-4" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <ImageIcon className="w-4 h-4" />;
      case 'mp3':
      case 'wav':
        return <Music className="w-4 h-4" />;
      case 'mp4':
      case 'avi':
      case 'mov':
        return <Video className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const getFileTypeColor = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    switch (extension) {
      case 'pdf':
        return 'bg-red-100 text-red-800';
      case 'doc':
      case 'docx':
        return 'bg-blue-100 text-blue-800';
      case 'txt':
        return 'bg-gray-100 text-gray-800';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'bg-green-100 text-green-800';
      case 'mp3':
      case 'wav':
        return 'bg-purple-100 text-purple-800';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2">
        <h3 className="text-lg text-foreground">Create from Content</h3>
        <p className="text-muted-foreground text-sm">Generate study materials from YouTube videos or uploaded files</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* YouTube Input */}
        <Card className="p-6 clay-card border-0">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <Youtube className="w-4 h-4 text-red-600" />
              </div>
              <h4 className="text-foreground">YouTube Video</h4>
            </div>
            
            <div className="space-y-3">
              <Input
                placeholder="Paste YouTube URL here..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="clay-input border-0 focus:ring-2 focus:ring-red-200"
              />
              
              <Button
                onClick={handleYoutubeSubmit}
                disabled={!youtubeUrl.trim()}
                className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl clay-button"
              >
                <Link className="w-4 h-4 mr-2" />
                Process Video
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Educational videos work best</p>
              <p>• AI will extract key concepts</p>
              <p>• Supports most YouTube formats</p>
            </div>
          </div>
        </Card>

        {/* File Upload */}
        <div className="flex justify-center items-center">
          <div 
            className={`upload-container ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="upload-header">
              <Upload />
              <p>Drop files here or click to browse</p>
              <div className="text-xs text-muted-foreground mt-2">
                <p>Accepted: {acceptedTypes.join(', ')}</p>
              </div>
            </div>
            
            <button 
              className="upload-footer"
              onClick={() => fileInputRef.current?.click()}
            >
              <p>Choose Files</p>
              <Upload />
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="upload-file-input"
            />
          </div>
        </div>
      </div>

      {/* Selected Files Display */}
      {selectedFiles.length > 0 && (
        <Card className="p-4 clay-card border-0">
          <div className="space-y-3">
            <h4 className="text-foreground text-sm">Selected Files ({selectedFiles.length})</h4>
            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-card rounded-lg border clay-input">
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getFileTypeColor(file.name)} p-1`}>
                      {getFileIcon(file.name)}
                    </Badge>
                    <div>
                      <p className="text-foreground text-sm truncate max-w-48">{file.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => removeFile(index)}
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-red-500 p-1 h-auto"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}