"use client";
import { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

export default function Home() {
  const [status, setStatus] = useState('Gözlənilir...');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const ffmpegRef = useRef(new FFmpeg());

  const processVideo = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    const gif = e.target.gif.files[0];
    const mp3 = e.target.mp3.files[0];

    if (!gif || !mp3) {
      alert("Zəhmət olmasa hər iki faylı seçin!");
      setLoading(false);
      return;
    }

    const ffmpeg = ffmpegRef.current;
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    
    setStatus('FFmpeg yüklənir...');
    await ffmpeg.load({
      corePath: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmPath: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    setStatus('Fayllar hazırlanır...');
    await ffmpeg.writeFile('input.gif', await fetchFile(gif));
    await ffmpeg.writeFile('input.mp3', await fetchFile(mp3));

    setStatus('Video render olunur (Bu bir az vaxt ala bilər)...');
    
    // FFmpeg komandası: GIF-i dövr etdirir (loop), MP3 əlavə edir, 480p edir
    await ffmpeg.exec([
      '-ignore_loop', '0',
      '-i', 'input.gif',
      '-i', 'input.mp3',
      '-vf', 'fps=25,scale=trunc(iw/2)*2:480', 
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-shortest',
      'output.mp4'
    ]);

    const data = await ffmpeg.readFile('output.mp4');
    const url = URL.createObjectURL(new Blob([(data as any).buffer], { type: 'video/mp4' }));
    setVideoUrl(url);
    setStatus('Tamamlandı!');
    setLoading(false);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-8">GIF + MP3 to MP4 Converter</h1>
      
      <form onSubmit={processVideo} className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="mb-4">
          <label className="block mb-2 text-sm font-medium">GIF Seçin:</label>
          <input type="file" name="gif" accept="image/gif" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
        </div>
        
        <div className="mb-6">
          <label className="block mb-2 text-sm font-medium">MP3 Seçin:</label>
          <input type="file" name="mp3" accept="audio/mpeg" className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 disabled:bg-gray-600"
        >
          {loading ? 'İşlənilir...' : 'Videonu Hazırla (480p)'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-yellow-400 mb-4">{status}</p>
        {videoUrl && (
          <div>
            <video src={videoUrl} controls className="max-w-full rounded-lg mb-4" />
            <a href={videoUrl} download="result.mp4" className="bg-green-600 px-6 py-2 rounded-full font-bold">Videonu Endir</a>
          </div>
        )}
      </div>
    </main>
  );
}
