import React from 'react';
import { ExternalLink } from 'lucide-react';

const AdCard = ({ ad }) => {
  const handleClick = () => {
    if (ad.link) {
      window.open(ad.link, '_blank');
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all ${ad.link ? 'cursor-pointer hover:shadow-lg hover:border-cyan-200' : ''}`}
      style={{ width: ad.width ? `${ad.width}px` : 'auto', height: ad.height ? `${ad.height}px` : 'auto' }}
    >
      {ad.type === 'image' && ad.imageUrl ? (
        <div className="relative w-full h-full">
          <img src={ad.imageUrl} alt={ad.title} className="w-full h-full object-cover" />
          {ad.link && (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-2">
              <ExternalLink size={16} className="text-slate-600" />
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 h-full flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-800 mb-2">{ad.title}</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">{ad.content}</p>
          </div>
          {ad.link && (
            <div className="flex items-center gap-1 text-cyan-600 text-xs font-bold mt-4">
              了解更多 <ExternalLink size={14} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdCard;
