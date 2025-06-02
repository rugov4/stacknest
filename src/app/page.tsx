'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import FileUpload from '@/components/FileUpload';
import ImageEditor from '@/components/ImageEditor';
import { extractYouTubeVideoId, getYouTubeThumbnailUrls } from '@/utils/youtube';

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [editedImage, setEditedImage] = useState<string | null>(null);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setThumbnails([]); // Clear YouTube thumbnails
    setSelectedThumbnail(null);
    
    // Create preview URL for the file
    const fileUrl = URL.createObjectURL(file);
    setFilePreview(fileUrl);
    setEditedImage(null);

    // Clean up the URL when component unmounts
    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  }, []);

  const handleYoutubeUrl = () => {
    setError('');
    setFilePreview(null);
    setSelectedThumbnail(null);
    setEditedImage(null);
    
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

  const handleThumbnailSelect = (url: string) => {
    setSelectedThumbnail(url);
    setFilePreview(null);
    setEditedImage(null);
  };

  const handleImageSave = (editedImageUrl: string) => {
    setEditedImage(editedImageUrl);
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
                  <div 
                    key={index} 
                    className={`relative aspect-video cursor-pointer ${
                      selectedThumbnail === url ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleThumbnailSelect(url)}
                  >
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

          {/* Image Editor */}
          {(filePreview || selectedThumbnail) && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Edit Thumbnail</h2>
              <ImageEditor
                imageUrl={filePreview || selectedThumbnail || ''}
                onSave={handleImageSave}
              />
            </div>
          )}

          {/* Preview Final Image */}
          {editedImage && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Final Thumbnail</h2>
              <div className="relative aspect-video w-full max-w-2xl mx-auto">
                <Image
                  src={editedImage}
                  alt="Final thumbnail"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="mt-4 text-center">
                <a
                  href={editedImage}
                  download="thumbnail.png"
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors inline-block"
                >
                  Download Thumbnail
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
