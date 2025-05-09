import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Place } from "@shared/schema";
import { useState, useEffect } from 'react';
import { fetchWikimediaImage } from "@/lib/wikimedia-api";
import { AttractionInfoDialog } from "../attraction-info-dialog";

interface FeaturedPlacesProps {
  places: Place[];
  isLoading: boolean;
}

const FeaturedPlaces: React.FC<FeaturedPlacesProps> = ({ places, isLoading }) => {
  const [_, setLocation] = useLocation();
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState('');
  const [placesWithImages, setPlacesWithImages] = useState<Place[]>([]);

  // Fetch Wikimedia images for places without them
  useEffect(() => {
    async function fetchMissingImages() {
      if (!isLoading && places.length > 0) {
        // We'll work with a copy of the places array
        const updatedPlaces = [...places];
        let hasUpdates = false;

        // Process only attractions without Wikimedia images
        for (let i = 0; i < updatedPlaces.length; i++) {
          const place = updatedPlaces[i];
          if (
            ['attraction', 'monument', 'heritage', 'landmark'].includes(place.category) && 
            !place.wikimediaThumbnailUrl
          ) {
            try {
              const searchTerm = `${place.name} ${place.location} Maharashtra India`;
              const imageInfo = await fetchWikimediaImage(searchTerm);
              
              if (imageInfo) {
                // Update the place with Wikimedia info
                updatedPlaces[i] = {
                  ...place,
                  imageUrl: imageInfo.thumbnailUrl, // Use as fallback image too
                  wikimediaThumbnailUrl: imageInfo.thumbnailUrl,
                  wikimediaDescription: imageInfo.descriptionHtml,
                  wikimediaArtist: imageInfo.artistName,
                  wikimediaAttributionUrl: imageInfo.attributionUrl,
                  wikimediaLicense: imageInfo.licenseName,
                  wikimediaLicenseUrl: imageInfo.licenseUrl
                };
                hasUpdates = true;
              }
            } catch (error) {
              console.error(`Error fetching image for ${place.name}:`, error);
            }
          }
        }

        if (hasUpdates) {
          setPlacesWithImages(updatedPlaces);
        } else {
          setPlacesWithImages(places);
        }
      }
    }

    fetchMissingImages();
  }, [places, isLoading]);

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>

        <div className="flex space-x-3 overflow-x-auto pb-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex-shrink-0 w-40 rounded-lg overflow-hidden shadow-md">
              <Skeleton className="w-full h-24" />
              <div className="p-2">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter for all attractions without limiting to 5
  const featuredPlaces = (placesWithImages.length > 0 ? placesWithImages : places).filter(place => 
    ['attraction', 'monument', 'heritage', 'landmark'].includes(place.category)
  );

  return (
    <>
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Featured Places</h3>
        <button 
          onClick={() => setLocation('/search')}
          className="text-[#DC143C] text-sm"
        >
          View All
        </button>
      </div>

      <div className="flex space-x-3 overflow-x-auto pb-2">
        {featuredPlaces.length > 0 ? (
          featuredPlaces.map((place) => (
            <div key={place.id} className="flex-shrink-0 w-40 rounded-lg overflow-hidden shadow-md">
              <div className="relative">
                <div 
                  className="w-full h-24 bg-gray-200 bg-cover bg-center"
                  style={{ backgroundImage: `url(${place.wikimediaThumbnailUrl || place.imageUrl || ''})` }}
                ></div>
                {place.wikimediaAttributionUrl && (
                  <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] p-1">
                    <a 
                      href={place.wikimediaAttributionUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      © {place.wikimediaArtist?.split(' ')[0] || 'Wikimedia'}
                    </a>
                  </div>
                )}
              </div>
              <div className="p-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-sm">{place.name}</h4>
                    <p className="text-xs text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3 mr-1 text-gray-500"
                      >
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      {place.location}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedPlace(place.name);
                      setInfoDialogOpen(true);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 py-4 text-center w-full">No featured places available</p>
        )}
      </div>
    </div>
    {infoDialogOpen && (
      <AttractionInfoDialog 
        attractionName={selectedPlace} 
        isOpen={infoDialogOpen}
        onClose={() => setInfoDialogOpen(false)} 
      />
    )}
    </>
  );
};

export default FeaturedPlaces;