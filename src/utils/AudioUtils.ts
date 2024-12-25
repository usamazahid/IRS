// utils/AudioUtils.ts
import RNFS from 'react-native-fs'; 

// import {FFmpegKit} from 'ffmpeg-kit-react-native';

/**
 * Reads the audio file as base64
 * @param {string} path - The path to the audio file
 * @returns {Promise<string | null>} - Returns base64 string of audio data
 */
export const readAudioFileAsBase64 = async (
  path: string,
): Promise<string | null> => {
  try {
    return await RNFS.readFile(path, 'base64');
  } catch (error) {
    console.error('Error reading audio file:', error);
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


/**
 * Compresses the given audio file
 * @param {string} audioUri - The path to the original audio file
 * @returns {Promise<string | null>} - Returns base64 string of the compressed audio file
 */
// export const compressAudio = async (audioUri: string): Promise<string | null> => {
//    try {
//      const formattedAudioUri = audioUri.startsWith('file://')
//        ? audioUri.substring(7)
//        : audioUri;

//      // Output path with correct extension
//      const compressedAudioPath = `${RNFS.TemporaryDirectoryPath}/compressed_audio.m4a`;

//      // FFmpeg command for AAC
//      const ffmpegCommand = `-y -i "${formattedAudioUri}" -b:a 64k -c:a aac "${compressedAudioPath}"`;
    

//      // Execute FFmpeg command
//      const session = await FFmpegKit.execute(ffmpegCommand);

//      const returnCode = await session.getReturnCode();
//      if (returnCode.isValueSuccess()) {
//        console.log('FFmpeg compression successful.');

//        const compressedAudioBase64 = await RNFS.readFile(
//          compressedAudioPath,
//          'base64',
//        );

//        console.log('Audio size before:', await getFileSize(formattedAudioUri));
//        console.log('Audio size after:', await getFileSize(compressedAudioPath));

//        return compressedAudioBase64;
//      } else {
//        const failStackTrace = await session.getFailStackTrace();
//        console.error('FFmpeg error:', failStackTrace || 'Unknown error');
//        return null;
//      }
//    } catch (error) {
//      console.error('Error compressing audio:', error);
//      return null;
//    }
//  };
