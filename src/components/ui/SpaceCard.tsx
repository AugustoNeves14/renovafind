import React from 'react';
import { Star, MapPin, Heart, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SpaceCardProps {
  id: string;
  name: string;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  price: string;
  tags?: string[];
  isSaved?: boolean;
  onSave?: () => void;
  onDetails?: () => void;
}

const SpaceCard: React.FC<SpaceCardProps> = ({
  id,
  name,
  category,
  image,
  rating,
  reviews,
  location,
  price,
  tags = [],
  isSaved = false,
  onSave,
  onDetails,
}) => {
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
      {/* Image with overlay */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {tags.length > 0 && (
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
          onClick={onSave}
        >
          <Heart className={cn("w-5 h-5", isSaved && "fill-red-500")} />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-red-500">{category}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-semibold">{rating}</span>
            <span className="text-sm text-gray-500">({reviews})</span>
          </div>
        </div>

        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-500 transition-colors">
          {name}
        </h3>

        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{location}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{price}</span>
          <Button
            variant="default"
            size="sm"
            className="bg-red-500 hover:bg-red-600"
            onClick={onDetails}
          >
            Ver Detalhes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpaceCard;