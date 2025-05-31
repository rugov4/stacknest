'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import FileUpload from '@/components/FileUpload';
import { extractYouTubeVideoId, getYouTubeThumbnailUrls } from '@/utils/youtube';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setThumbnails([]); // Clear YouTube thumbnails when file is uploaded
    
    // Create preview URL for the file
    const fileUrl = URL.createObjectURL(file);
    setFilePreview(fileUrl);

    // Clean up the URL when component unmounts
    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, []);

  const handleYoutubeUrl = () => {
    setError('');
    setFilePreview(null); // Clear file preview when using YouTube URL
    if (!youtubeUrl) {
      setError('Please enter a YouTube URL');
      return;
    }

    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    const urls = getYouTubeThumbnailUrls(videoId);
    setThumbnails([urls.default, urls.medium, urls.high, urls.max]);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          YouTube Thumbnail Generator
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* File Upload Section */}
          <div className="mb-8">
            <FileUpload onFileSelect={handleFileSelect} />
            {filePreview && (
              <div className="mt-4">
                <h2 className="text-xl font-semibold mb-4">Uploaded File Preview</h2>
                <div className="relative aspect-video w-full max-w-2xl mx-auto">
                  {selectedFile?.type.startsWith('video/') ? (
                    <video
                      src={filePreview}
                      controls
                      className="w-full h-full rounded-lg"
                    />
                  ) : (
                    <Image
                      src={filePreview}
                      alt="Uploaded file preview"
                      fill
                      className="object-contain rounded-lg"
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          {/* YouTube URL Input */}
          <div className="mb-8">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Or enter YouTube video URL..."
                className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
              />
              <button 
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
                onClick={handleYoutubeUrl}
              >
                Generate
              </button>
            </div>
            {error && (
              <p className="text-red-500 mt-2 text-sm">{error}</p>
            )}
          </div>

          {/* Thumbnails Preview */}
          {thumbnails.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Available Thumbnails</h2>
              <div className="grid grid-cols-2 gap-4">
                {thumbnails.map((url, index) => (
                  <div key={index} className="relative aspect-video">
                    <Image
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover rounded-lg"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Template Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Choose a Template</h2>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((template) => (
                <div
                  key={template}
                  className="border-2 border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 transition-colors"
                >
                  <div className="aspect-video bg-gray-100 rounded mb-2"></div>
                  <p className="text-center text-sm text-gray-600">
                    Template {template}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Customization Options */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Customize</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title Text
                </label>
                <input
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Enter title for thumbnail..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Style
                </label>
                <select className="w-full p-3 border border-gray-300 rounded-lg">
                  <option>Bold Sans-Serif</option>
                  <option>Clean Modern</option>
                  <option>Creative Display</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Scheme
                </label>
                <div className="flex space-x-2">
                  {['#FF0000', '#00FF00', '#0000FF', '#FFFF00'].map((color) => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-full border-2 border-gray-200"
                      style={{ backgroundColor: color }}
                    ></button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
