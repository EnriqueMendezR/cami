'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

type Language = 'english' | 'spanish';
type VideoType = 'website-sales' | 'act-of-endearment';

export interface UploadFormData {
  language: Language;
  type: VideoType;
  file: File;
}

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: UploadFormData) => void;
}

const languageOptions: { value: Language; label: string }[] = [
  { value: 'english', label: 'English' },
  { value: 'spanish', label: 'Spanish' },
];

const typeOptions: { value: VideoType; label: string }[] = [
  { value: 'website-sales', label: 'Website Sales' },
  { value: 'act-of-endearment', label: 'Act of Endearment' },
];

export function UploadModal({ open, onOpenChange, onSubmit }: UploadModalProps) {
  const [language, setLanguage] = useState<Language>('english');
  const [type, setType] = useState<VideoType>('website-sales');
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!file) return;
    onSubmit({ language, type, file });
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Upload Video</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Select a video and configure generation settings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl p-8 text-center cursor-pointer transition-colors group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <div className="space-y-1 w-full min-w-0">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center mx-auto">
                  <Upload className="w-4 h-4 text-zinc-300" />
                </div>
                <p className="text-sm text-zinc-200 font-medium truncate w-full px-4">
                  {file.name}
                </p>
                <p className="text-xs text-zinc-500">Click to change</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center mx-auto transition-colors">
                  <Upload className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-sm text-zinc-400">Click to select a video</p>
                <p className="text-xs text-zinc-600">MP4, MOV, WebM</p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">
              Language
            </label>
            <div className="flex gap-2">
              {languageOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setLanguage(value)}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                    language === value
                      ? 'border-white bg-white text-zinc-900 font-semibold'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">
              Type
            </label>
            <div className="flex gap-2">
              {typeOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setType(value)}
                  className={`flex-1 py-2 rounded-lg text-sm border transition-all cursor-pointer ${
                    type === value
                      ? 'border-white bg-white text-zinc-900 font-semibold'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!file}
            className="w-full cursor-pointer"
          >
            Generate Prompts
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
