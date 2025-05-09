// Wikimedia API integration for fetching images and information

interface WikimediaImageInfo {
  thumbnailUrl: string;
  descriptionHtml: string;
  artistName: string;
  attributionUrl: string;
  licenseName: string;
  licenseUrl: string;
}

/**
 * Fetches image information from Wikimedia Commons for a given search term
 * @param searchTerm - The place name or term to search for
 * @returns Promise with image information or null if not found
 */
export async function fetchWikimediaImage(searchTerm: string): Promise<WikimediaImageInfo | null> {
  try {
    // First search for images using the MediaWiki API
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&format=json&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.error('Wikimedia search API error:', await searchResponse.text());
      return null;
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      console.log('No images found for:', searchTerm);
      return null;
    }
    
    // Get the first result's title (File:something.jpg)
    const imageTitle = searchData.query.search[0].title;
    
    // Get image info using the MediaWiki API
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(imageTitle)}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
    
    const infoResponse = await fetch(infoUrl);
    
    if (!infoResponse.ok) {
      console.error('Wikimedia info API error:', await infoResponse.text());
      return null;
    }
    
    const infoData = await infoResponse.json();
    const pages = infoData.query.pages;
    const pageId = Object.keys(pages)[0];
    const imageInfo = pages[pageId].imageinfo[0];
    
    if (!imageInfo) {
      console.error('No image info found for:', imageTitle);
      return null;
    }
    
    // Get thumbnail URL (scaled version of the image)
    const thumbUrl = imageInfo.thumburl || imageInfo.url;
    
    // Extract metadata
    const metadata = imageInfo.extmetadata || {};
    
    return {
      thumbnailUrl: thumbUrl,
      descriptionHtml: metadata.ImageDescription?.value || '',
      artistName: metadata.Artist?.value || 'Unknown',
      attributionUrl: imageInfo.descriptionurl || '',
      licenseName: metadata.License?.value || 'Unknown license',
      licenseUrl: metadata.LicenseUrl?.value || ''
    };
  } catch (error) {
    console.error('Error fetching Wikimedia image:', error);
    return null;
  }
}

/**
 * Fetches multiple images for a given search term
 * @param searchTerm - The place name or term to search for
 * @param limit - Maximum number of images to return (default: 5)
 * @returns Promise with an array of image information
 */
export async function fetchWikimediaImages(searchTerm: string, limit: number = 5): Promise<WikimediaImageInfo[]> {
  try {
    // Search for images using the MediaWiki API
    const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchTerm)}&srnamespace=6&srlimit=${limit}&format=json&origin=*`;
    
    const searchResponse = await fetch(searchUrl);
    
    if (!searchResponse.ok) {
      console.error('Wikimedia search API error:', await searchResponse.text());
      return [];
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.query || !searchData.query.search || searchData.query.search.length === 0) {
      console.log('No images found for:', searchTerm);
      return [];
    }
    
    // Get all image titles
    const imageTitles = searchData.query.search.map((result: any) => result.title);
    
    // Get info for all images in a single request
    const titleParam = imageTitles.map(encodeURIComponent).join('|');
    const infoUrl = `https://commons.wikimedia.org/w/api.php?action=query&titles=${titleParam}&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
    
    const infoResponse = await fetch(infoUrl);
    
    if (!infoResponse.ok) {
      console.error('Wikimedia info API error:', await infoResponse.text());
      return [];
    }
    
    const infoData = await infoResponse.json();
    const pages = infoData.query.pages;
    
    // Process each image
    return Object.values(pages)
      .filter((page: any) => page.imageinfo && page.imageinfo.length > 0)
      .map((page: any) => {
        const imageInfo = page.imageinfo[0];
        const metadata = imageInfo.extmetadata || {};
        
        return {
          thumbnailUrl: imageInfo.thumburl || imageInfo.url,
          descriptionHtml: metadata.ImageDescription?.value || '',
          artistName: metadata.Artist?.value || 'Unknown',
          attributionUrl: imageInfo.descriptionurl || '',
          licenseName: metadata.License?.value || 'Unknown license',
          licenseUrl: metadata.LicenseUrl?.value || ''
        };
      });
  } catch (error) {
    console.error('Error fetching Wikimedia images:', error);
    return [];
  }
} 