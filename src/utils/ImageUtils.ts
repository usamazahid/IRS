
import RNFS from 'react-native-fs'; 
import ImageResizer from '@bam.tech/react-native-image-resizer';

/**
 * Reads the image file as base64
 * @param {string} imageUri - The URI of the image file
 * @returns {Promise<string | null>} - Returns base64 string of image data
 */
export const readImageFileAsBase64 = async (
  imageUri: string,
): Promise<string | null> => {
  try {
    return await RNFS.readFile(imageUri, 'base64');
  } catch (error) {
    console.error('Error reading image file:', error); 
    return null;
  }
};
 
export const handleImageConversion = async (imageUri: string) => {
  const imageBase64 = await readImageFileAsBase64(imageUri);
  if (imageBase64) {
    return imageBase64;
    // You can now send this to the backend
  }
  return null;
};


export const compressImage = async (
  imageUri: string,
): Promise<string | null> => {
  try {
    const resizedImage = await ImageResizer.createResizedImage(
      imageUri,
      800, // New width
      800, // New height
      'JPEG', // Format
      80, // Quality percentage
      0, // Rotation
    );

    const compressedImageBase64 = await RNFS.readFile(
      resizedImage.uri,
      'base64',
    );
    console.log('Image size before:', await getFileSize(imageUri));
    console.log('Image size after:', await getFileSize(resizedImage.uri));
    return compressedImageBase64;
  } catch (error) {
    console.error('Error compressing image:', error);
    return null;
  }
};

export const getFileSize = async (filePath: string): Promise<number> => {
  try {
    const stat = await RNFS.stat(filePath);
    return stat.size;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

interface ImageDTO {
  imageDate: string;
  imageData: string | null;
  error?: unknown;
}
export const fillImageDto = async (capturedData: string[]): Promise<ImageDTO[]> => {
  let imageDTOs: ImageDTO[] = [];
  
  if (capturedData.length > 0) {
    const results = await Promise.allSettled(
      capturedData.map(uri => compressImage(uri))
    );

    imageDTOs = results.map<ImageDTO>((result) => {
      const baseImageDto = {
        imageDate: new Date().toISOString(),
        imageData: null
      };

      if (result.status === 'fulfilled') {
        return {
          ...baseImageDto,
          imageData: result.value
        };
      } else {
        return {
          ...baseImageDto,
          error: result.reason
        };
      }
    });
  }
  
  return imageDTOs;
};