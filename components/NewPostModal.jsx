"use client";

import { useState, useRef, useCallback } from 'react';
import { X, ImagePlus } from 'lucide-react';
import supabase from "@/utils/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

export default function NewPostModal({ isOpen, onClose, onPostCreated }) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const resetForm = useCallback(() => {
    setText('');
    setImage(null);
    setPreviewUrl(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      setError(null);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let imageUrl = null;
      
      // Upload image if one is selected
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        // Use a simple file path without nested folders
        const filePath = fileName;
        
        const { error: uploadError, data } = await supabase.storage
          .from('posts')
          .upload(filePath, image);
          
        if (uploadError) {
          // Check if it's a bucket not found error
          if (uploadError.message && uploadError.message.includes('Bucket not found')) {
            throw new Error('Storage bucket "posts" not found. Please create it in the Supabase dashboard.');
          } else {
            throw uploadError;
          }
        }
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);
          
        imageUrl = publicUrl;
      }
      
      // Create post
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          text: text.trim(),
          image: imageUrl,
          comments: 0,
          likes: 0
        });
        
      if (postError) throw postError;
      
      // Reset form and close modal
      resetForm();
      onPostCreated?.();
      handleClose();
      
    } catch (error) {
      console.error('Error creating post:', error);
      setError(error.message || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-lg w-full p-6 border border-neutral-200/50 dark:border-neutral-800/50 shadow-xl relative">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-4 top-4 text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-6">Create New Post</h2>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Text input */}
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What's on your mind?"
              required
              disabled={isSubmitting}
              rows={4}
              className="w-full p-3 bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white placeholder:text-neutral-500 dark:placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-transparent resize-none disabled:opacity-50"
            />
          </div>

          {/* Image upload */}
          <div>
            <div 
              onClick={() => !isSubmitting && fileInputRef.current?.click()}
              className={`cursor-pointer group ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {previewUrl ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img 
                    src={previewUrl} 
                    alt="Post preview" 
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-sm">Change image</span>
                  </div>
                </div>
              ) : (
                <div className="h-48 rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 flex items-center justify-center bg-neutral-50 dark:bg-neutral-800/50 group-hover:border-primary dark:group-hover:border-primary transition-colors">
                  <div className="flex flex-col items-center gap-2 text-neutral-500 dark:text-neutral-400">
                    <ImagePlus className="w-8 h-8" />
                    <span className="text-sm">Click to upload an image</span>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isSubmitting}
              className="hidden"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Max file size: 5MB
            </p>
          </div>

          {/* Submit button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !text.trim()}
              className="px-6 py-2 rounded-full font-medium bg-primary hover:bg-primary/90 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </>
              ) : (
                'Post'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}