import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchWikimediaImage, type WikimediaImageInfo } from "@/lib/wikimedia-api";

interface AttractionInfoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  attractionName: string;
}

export function AttractionInfoDialog({ isOpen, onClose, attractionName }: AttractionInfoDialogProps) {
  const [wikiData, setWikiData] = useState<string | null>(null);
  const [wikimediaInfo, setWikimediaInfo] = useState<WikimediaImageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (isOpen && attractionName) {
        setIsLoading(true);
        
        // Fetch description from Wikipedia
        try {
          const wikiResponse = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(attractionName)}`);
          const wikiData = await wikiResponse.json();
          setWikiData(wikiData.extract);
        } catch (error) {
          console.error("Error fetching Wikipedia data:", error);
          setWikiData("Could not fetch information for this attraction.");
        }
        
        // Fetch image from Wikimedia
        try {
          const searchTerm = `${attractionName} Maharashtra India`;
          const imageInfo = await fetchWikimediaImage(searchTerm);
          setWikimediaInfo(imageInfo);
        } catch (error) {
          console.error("Error fetching Wikimedia image:", error);
        }
        
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, [isOpen, attractionName]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">{attractionName}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-48 w-full mb-4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-[90%]" />
              <Skeleton className="h-4 w-[95%]" />
            </div>
          ) : (
            <div className="space-y-4">
              {wikimediaInfo && (
                <div className="space-y-2">
                  <div className="relative">
                    <img 
                      src={wikimediaInfo.thumbnailUrl} 
                      alt={attractionName}
                      className="w-full h-auto rounded-md object-cover max-h-[300px]"
                    />
                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs p-1 rounded-tl">
                      <a 
                        href={wikimediaInfo.attributionUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline"
                      >
                        By {wikimediaInfo.artistName}
                      </a>
                      {' • '}
                      <a 
                        href={wikimediaInfo.licenseUrl} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="hover:underline"
                      >
                        {wikimediaInfo.licenseName}
                      </a>
                    </div>
                  </div>
                  
                  <div 
                    className="text-sm text-gray-500 italic"
                    dangerouslySetInnerHTML={{ __html: wikimediaInfo.descriptionHtml }}
                  />
                </div>
              )}
              
              <p className="text-gray-700 leading-relaxed">{wikiData}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
