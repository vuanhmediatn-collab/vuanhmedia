import React from 'react';
import { Video, Image as ImageIcon } from 'lucide-react';

export type MediaTabKey = 'videos' | 'images';

interface MediaTabsProps {
  activeTab: MediaTabKey;
  videoCount: number;
  imageCount: number;
  onTabChange: (tab: MediaTabKey) => void;
}

export const MediaTabs: React.FC<MediaTabsProps> = ({
  activeTab,
  videoCount,
  imageCount,
  onTabChange,
}) => {
  return (
    <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
      <button
        type="button"
        onClick={() => onTabChange('videos')}
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'videos'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        <Video className="w-4 h-4" />
        <span>Video Clip</span>
        <span
          className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
            activeTab === 'videos' ? 'bg-slate-700 text-white' : 'bg-slate-200/80 text-slate-600'
          }`}
        >
          {videoCount}
        </span>
      </button>

      <button
        type="button"
        onClick={() => onTabChange('images')}
        className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
          activeTab === 'images'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
        }`}
      >
        <ImageIcon className="w-4 h-4" />
        <span>Hình ảnh Gallery</span>
        <span
          className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
            activeTab === 'images' ? 'bg-slate-700 text-white' : 'bg-slate-200/80 text-slate-600'
          }`}
        >
          {imageCount}
        </span>
      </button>
    </div>
  );
};
