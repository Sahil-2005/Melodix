// import React, { useState, useRef, useEffect } from "react";
// import { Play, Pause, SkipForward, SkipBack, Plus, Trash } from "lucide-react";

// export default function App() {
//   const [songs, setSongs] = useState([]);
//   const [playlists, setPlaylists] = useState({});
//   const [currentPlaylist, setCurrentPlaylist] = useState(null);
//   const [currentSongIndex, setCurrentSongIndex] = useState(0);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [newPlaylistName, setNewPlaylistName] = useState("");
//   const [progress, setProgress] = useState(0);
//   const audioRef = useRef(null);

//   const handleFileUpload = (event) => {
//     const files = Array.from(event.target.files);
//     const newSongs = files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
//     if (currentPlaylist) {
//       setPlaylists((prev) => ({
//         ...prev,
//         [currentPlaylist]: [...(prev[currentPlaylist] || []), ...newSongs],
//       }));
//     } else {
//       setSongs((prev) => [...prev, ...newSongs]);
//     }
//   };

//   const createPlaylist = () => {
//     if (newPlaylistName && !playlists[newPlaylistName]) {
//       setPlaylists((prev) => ({ ...prev, [newPlaylistName]: [] }));
//       setNewPlaylistName("");
//     }
//   };

//   const deletePlaylist = (playlistName) => {
//     const updatedPlaylists = { ...playlists };
//     delete updatedPlaylists[playlistName];
//     setPlaylists(updatedPlaylists);
//     if (currentPlaylist === playlistName) setCurrentPlaylist(null);
//   };

//   const deleteSong = (index) => {
//     if (!currentPlaylist) return;
//     const updatedSongs = [...playlists[currentPlaylist]];
//     updatedSongs.splice(index, 1);
//     setPlaylists((prev) => ({ ...prev, [currentPlaylist]: updatedSongs }));
//     if (currentSongIndex === index) {
//       setCurrentSongIndex(0);
//       setIsPlaying(false);
//     }
//   };

//   const playSong = (index) => {
//     setCurrentSongIndex(index);
//     setIsPlaying(true);
//     if (audioRef.current) {
//       audioRef.current.src = (currentPlaylist ? playlists[currentPlaylist] : songs)[index].url;
//       audioRef.current.play();
//     }
//   };

//   const playNext = () => {
//     if (!currentPlaylist) return;
//     const nextIndex = (currentSongIndex + 1) % playlists[currentPlaylist].length;
//     playSong(nextIndex);
//   };

//   const playPrevious = () => {
//     if (!currentPlaylist) return;
//     const prevIndex = (currentSongIndex - 1 + playlists[currentPlaylist].length) % playlists[currentPlaylist].length;
//     playSong(prevIndex);
//   };

//   const togglePlayPause = () => {
//     if (audioRef.current.paused) {
//       audioRef.current.play();
//       setIsPlaying(true);
//     } else {
//       audioRef.current.pause();
//       setIsPlaying(false);
//     }
//   };

//   useEffect(() => {
//     const updateProgress = () => {
//       if (audioRef.current) {
//         setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
//       }
//     };
//     audioRef.current?.addEventListener("timeupdate", updateProgress);
//     return () => audioRef.current?.removeEventListener("timeupdate", updateProgress);
//   }, []);

//   const handleSeek = (e) => {
//     if (audioRef.current) {
//       const newTime = (e.target.value / 100) * audioRef.current.duration;
//       audioRef.current.currentTime = newTime;
//       setProgress(e.target.value);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center p-6 bg-base-200 min-h-screen w-full">
//       <h1 className="text-3xl font-extrabold mb-6 text-center">🎵 React Music Player</h1>
      
//       {/* Playlist Management */}
//       <div className="flex gap-2 mb-4">
//         <input type="text" placeholder="New Playlist" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} className="input input-bordered" />
//         <button className="btn btn-primary" onClick={createPlaylist}><Plus size={20} /></button>
//       </div>
      
//       <div className="flex flex-wrap gap-4 mb-4">
//         {Object.keys(playlists).map((playlist) => (
//           <div key={playlist} className="badge badge-lg badge-secondary cursor-pointer" onClick={() => setCurrentPlaylist(playlist)}>
//             {playlist}
//             <button className="ml-2" onClick={() => deletePlaylist(playlist)}><Trash size={16} /></button>
//           </div>
//         ))}
//       </div>
      
//       <label className="btn btn-primary">
//         Upload Music
//         <input type="file" multiple accept="audio/*" onChange={handleFileUpload} className="hidden" />
//       </label>
      
//       <ul className="w-full max-w-md mt-6 bg-base-100 p-4 rounded-lg shadow-lg">
//         {(currentPlaylist ? playlists[currentPlaylist] : songs).map((song, index) => (
//           <li key={index} className="flex justify-between p-2 my-2 rounded-lg cursor-pointer transition bg-base-300 hover:bg-primary hover:text-white">
//             <span onClick={() => playSong(index)}>{song.name}</span>
//             <button onClick={() => deleteSong(index)}><Trash size={16} /></button>
//           </li>
//         ))}
//       </ul>
      
//       <input type="range" value={progress} onChange={handleSeek} className="w-full max-w-md mt-4" />
      
//       <div className="flex items-center gap-4 mt-6 bg-base-100 p-4 rounded-lg shadow-lg">
//         <button className="btn btn-outline" onClick={playPrevious}><SkipBack size={24} /></button>
//         <button className="btn btn-outline" onClick={togglePlayPause}>{isPlaying ? <Pause size={24} /> : <Play size={24} />}</button>
//         <button className="btn btn-outline" onClick={playNext}><SkipForward size={24} /></button>
//       </div>
      
//       <audio ref={audioRef} controls className="hidden" />
//     </div>
//   );
// }




import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipForward, SkipBack, Plus, Trash } from "lucide-react";

export default function App() {
  const [songs, setSongs] = useState([]);
  const [playlists, setPlaylists] = useState({});
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [progress, setProgress] = useState(0);
  const audioRef = useRef(null);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const newSongs = files.map((file) => ({ url: URL.createObjectURL(file), name: file.name }));
    if (currentPlaylist) {
      setPlaylists((prev) => ({
        ...prev,
        [currentPlaylist]: [...(prev[currentPlaylist] || []), ...newSongs],
      }));
    } else {
      setSongs((prev) => [...prev, ...newSongs]);
    }
  };

  const createPlaylist = () => {
    if (newPlaylistName && !playlists[newPlaylistName]) {
      setPlaylists((prev) => ({ ...prev, [newPlaylistName]: [] }));
      setNewPlaylistName("");
    }
  };

  // const deletePlaylist = (playlistName) => {
  //   const updatedPlaylists = { ...playlists };
  //   delete updatedPlaylists[playlistName];
  //   setPlaylists(updatedPlaylists);
  //   if (currentPlaylist === playlistName) {
  //     setCurrentPlaylist(null);
  //     setCurrentSongIndex(null);
  //   }
  // };


  const deletePlaylist = (playlistName) => {
    setPlaylists((prev) => {
      const updatedPlaylists = { ...prev };
      delete updatedPlaylists[playlistName];
      return updatedPlaylists;
    });
  
    if (currentPlaylist === playlistName) {
      setCurrentPlaylist(null);
      setCurrentSongIndex(null);
    }
  };
  

  const deleteSong = (index) => {
    if (!currentPlaylist) return;
    const updatedSongs = [...playlists[currentPlaylist]];
    updatedSongs.splice(index, 1);
    setPlaylists((prev) => ({ ...prev, [currentPlaylist]: updatedSongs }));
    if (currentSongIndex === index) {
      playNext();
    }
  };

  const playSong = (index) => {
    setCurrentSongIndex(index);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = (currentPlaylist ? playlists[currentPlaylist] : songs)[index].url;
      audioRef.current.play();
    }
  };

  const playNext = () => {
    if (!currentPlaylist) return;
    const nextIndex = (currentSongIndex + 1) % playlists[currentPlaylist].length;
    playSong(nextIndex);
  };

  const playPrevious = () => {
    if (!currentPlaylist) return;
    const prevIndex = (currentSongIndex - 1 + playlists[currentPlaylist].length) % playlists[currentPlaylist].length;
    playSong(prevIndex);
  };

  const togglePlayPause = () => {
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.onended = playNext;
    }
  }, [currentSongIndex]);

  useEffect(() => {
    const updateProgress = () => {
      if (audioRef.current) {
        setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      }
    };
    audioRef.current?.addEventListener("timeupdate", updateProgress);
    return () => audioRef.current?.removeEventListener("timeupdate", updateProgress);
  }, []);

  const handleSeek = (e) => {
    if (audioRef.current) {
      const newTime = (e.target.value / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(e.target.value);
    }
  };

  return (
    // <div className="flex flex-col md:flex-row items-start p-6 bg-gradient-to-r from-blue-900 to-purple-800 text-white min-h-screen w-full">
    <div className="flex flex-col md:flex-row items-start p-6 text-white bg-base-300 min-h-screen w-full">
      <div className="w-full md:w-2/3">
        <h1 className="text-4xl font-bold mb-6 text-center">🎵 Premium Music Player</h1>
        <div className="flex gap-2 mb-4">
          <input type="text" placeholder="New Playlist" value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)} className="input input-bordered" />
          <button className="btn btn-success" onClick={createPlaylist}><Plus size={20} /></button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4 w-full">
          {Object.keys(playlists).map((playlist) => (
            <div key={playlist} className="badge badge-lg badge-secondary cursor-pointer w-full" onClick={() => setCurrentPlaylist(playlist)}>
              {playlist}
              <button className="ml-2 w-full cursor-pointer" onClick={() => deletePlaylist(playlist)}><Trash size={16} /></button>
            </div>
          ))}
        </div>
        <label className="btn btn-primary">
          Upload Music
          <input type="file" multiple accept="audio/*" onChange={handleFileUpload} className="hidden" />
        </label>
        {/* <ul className="w-full mt-6 bg-black p-4 rounded-lg shadow-lg"> */}
        {/* <ul className="w-full max-w-md mt-6 bg-base-100 p-4 rounded-lg shadow-lg">

          {(currentPlaylist ? playlists[currentPlaylist] : songs).map((song, index) => (
            <li key={index} className={`flex justify-between p-2 my-2 rounded-lg cursor-pointer transition ${index === currentSongIndex ? 'bg-green-500' : 'bg-gray-800 hover:bg-blue-600'}`}>
              <span onClick={() => playSong(index)}>{song.name}</span>
              <button onClick={() => deleteSong(index)}><Trash size={16} /></button>
            </li>
          ))}
        </ul> */}

        <ul className="w-full mt-6 bg-black p-4 rounded-lg shadow-lg">
          {(currentPlaylist && playlists[currentPlaylist] ? playlists[currentPlaylist] : songs).map((song, index) => (
            <li key={index} className={`flex justify-between p-2 my-2 rounded-lg cursor-pointer transition ${index === currentSongIndex ? 'bg-green-500' : 'bg-gray-800 hover:bg-blue-600'}`}>
              <span onClick={() => playSong(index)}>{song.name}</span>
              <button onClick={() => deleteSong(index)}>🗑</button>
            </li>
          ))}
        </ul>

      </div>
      <div className="w-full md:w-1/3 flex flex-col items-center p-6">
        {currentSongIndex !== null && currentPlaylist && (
          <div className="bg-black p-4 rounded-lg w-full text-center shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Now Playing</h2>
            <p className="text-lg">{playlists[currentPlaylist][currentSongIndex]?.name}</p>
            <input type="range" value={progress} onChange={handleSeek} className="w-full mt-4" />
            <div className="flex justify-center gap-4 mt-4">
              <button className="btn btn-outline" onClick={playPrevious}><SkipBack size={24} /></button>
              <button className="btn btn-outline" onClick={togglePlayPause}>{isPlaying ? <Pause size={24} /> : <Play size={24} />}</button>
              <button className="btn btn-outline" onClick={playNext}><SkipForward size={24} /></button>
            </div>
          </div>
        )}
      </div>
      <audio ref={audioRef} controls className="hidden" />
    </div>
  );
}
