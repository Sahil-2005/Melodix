/**
 * Creates a song object from a File
 * @param {File} file - The audio file
 * @returns {Object} Song object with url and name
 */
export const createSongFromFile = (file) => ({
  url: URL.createObjectURL(file),
  name: file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
  originalName: file.name,
});

/**
 * Creates song objects from an array of Files
 * @param {File[]} files - Array of audio files
 * @returns {Object[]} Array of song objects
 */
export const createSongsFromFiles = (files) => files.map(createSongFromFile);

/**
 * Revokes object URLs to prevent memory leaks
 * @param {Object[]} songs - Array of song objects
 */
export const revokeSongUrls = (songs) => {
  songs.forEach((song) => {
    if (song.url) {
      URL.revokeObjectURL(song.url);
    }
  });
};
