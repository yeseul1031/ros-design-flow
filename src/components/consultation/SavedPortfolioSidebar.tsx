import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SavedItem {
  id: string;
  image: string;
  title: string;
  type: 'liked' | 'uploaded';
}

interface SavedPortfolioSidebarProps {
  savedItems: SavedItem[];
  onRemove: (id: string) => void;
}

export const SavedPortfolioSidebar = ({ savedItems, onRemove }: SavedPortfolioSidebarProps) => {
  if (savedItems.length === 0) return null;

  return (
    <div className="w-80 bg-card border-l p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">저장한 포트폴리오</h3>
        <span className="text-sm text-muted-foreground">{savedItems.length}</span>
      </div>
      
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="grid grid-cols-2 gap-3">
          {savedItems.map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                {item.image.startsWith('http') ? (
                  <div className="w-full h-full flex items-center justify-center p-2 bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="text-center">
                      <div className="text-xs font-medium text-primary mb-1">참고사이트</div>
                      <div className="text-[10px] text-muted-foreground break-all line-clamp-3">{item.image}</div>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={item.image} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
              {item.type === 'uploaded' && (
                <div className="absolute bottom-1 left-1 bg-primary/80 text-primary-foreground text-xs px-2 py-0.5 rounded">
                  참고
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
