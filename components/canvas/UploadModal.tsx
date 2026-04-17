'use client';

import { useState, useRef } from 'react';
import { Upload } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';

type Language = 'english' | 'spanish';
type VideoType = 'website-sales' | 'act-of-endearment';

export interface UploadFormData {
  language: Language;
  type: VideoType;
  file: File;
  count: number;
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
  const [count, setCount] = useState(3);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if (!file) return;
    onSubmit({ language, type, file, count });
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700 text-white !max-w-5xl w-[900px] p-0 overflow-hidden">
        <div className="flex min-h-[520px]">
          {/* Left — video upload */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-80 shrink-0 flex flex-col items-center justify-center gap-5 border-r border-zinc-800 bg-zinc-950 cursor-pointer group transition-colors hover:bg-zinc-900 p-10"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file ? (
              <>
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Upload className="w-7 h-7 text-zinc-300" />
                </div>
                <div className="text-center min-w-0 w-full">
                  <p className="text-sm text-zinc-200 font-medium truncate px-2">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">Click to change</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center transition-colors">
                  <Upload className="w-7 h-7 text-zinc-400" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-zinc-300 font-medium">
                    Upload Video
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">MP4, MOV, WebM</p>
                </div>
              </>
            )}
          </div>

          {/* Right — form */}
          <div className="flex flex-col flex-1 p-10 gap-7">
            <div>
              <h2 className="text-xl font-semibold text-white">Generate UGC</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Configure your generation settings.
              </p>
            </div>

            <div className="space-y-5 flex-1">
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
                          ? "border-white bg-white text-zinc-900 font-semibold"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
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
                          ? "border-white bg-white text-zinc-900 font-semibold"
                          : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider block mb-2">
                  Number of Prompts
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCount((c) => Math.max(1, c - 1))}
                    className="w-9 h-9 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all cursor-pointer flex items-center justify-center text-lg leading-none"
                  >
                    −
                  </button>
                  <span className="flex-1 text-center text-white font-semibold text-xl tabular-nums">
                    {count}
                  </span>
                  <button
                    onClick={() => setCount((c) => Math.min(10, c + 1))}
                    className="w-9 h-9 rounded-lg border border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-all cursor-pointer flex items-center justify-center text-lg leading-none"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!file}
              className="w-full cursor-pointer border border-zinc-600"
            >
              Generate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
