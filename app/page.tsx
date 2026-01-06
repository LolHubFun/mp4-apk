"use client";
import { useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { CapacitorFFmpeg } from '@capgo/capacitor-ffmpeg'; // Düzgün ad budur

export default function Home() {
  const [logs, setLogs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const addLog = (msg: string) => {
    console.log(msg);
    setLogs(prev => [...prev.slice(-5), `> ${msg}`]);
  };

  const processVideo = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setLogs([]);
    setVideoUrl('');

    const visualFile = e.target.visual.files[0];
    const mp3 = e.target.mp3.files[0];

    if (!visualFile || !mp3) {
      alert("Zəhmət olmasa hər iki faylı seçin!");
      setLoading(false);
      return;
    }

    try {
      addLog("Fayllar prosessora hazırlanır...");

      const writeToCache = async (file: File, name: string) => {
        const reader = new FileReader();
        return new Promise<string>((resolve, reject) => {
          reader.onload = async () => {
            try {
              const base64Data = reader.result?.toString().split(',')[1] || '';
              await Filesystem.writeFile({
                path: name,
                data: base64Data,
                directory: Directory.Cache
              });
              const res = await Filesystem.getUri({ directory: Directory.Cache, path: name });
              resolve(res.uri.replace('file://', ''));
            } catch (err) { reject(err); }
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const visualPath = await writeToCache(visualFile, 'in_v');
      const mp3Path = await writeToCache(mp3, 'in_a');
      
      const cacheDir = visualPath.substring(0, visualPath.lastIndexOf('/'));
      const outPath = `${cacheDir}/result.mp4`;

      addLog("NATIVE RENDER BAŞLADI...");
      
      const isGif = visualFile.type === 'image/gif';
      
      const command = isGif
        ? `-ignore_loop 0 -i ${visualPath} -i ${mp3Path} -vf "fps=24,scale=trunc(iw/2)*2:720" -c:v libx264 -preset ultrafast -tune stillimage -pix_fmt yuv420p -shortest -y ${outPath}`
        : `-loop 1 -i ${visualPath} -i ${mp3Path} -vf "fps=24,scale=trunc(iw/2)*2:720" -c:v libx264 -preset ultrafast -tune stillimage -pix_fmt yuv420p -shortest -y ${outPath}`;

      // Burada 'as any' mütləqdir ki, TypeScript build-i dayandırmasın
      const result = await (CapacitorFFmpeg as any).execute({ command });

      if (result.code === 0 || result.message === "success") {
        addLog("VİDEO HAZIRLANDI!");
        const file = await Filesystem.readFile({
          path: 'result.mp4',
          directory: Directory.Cache
        });
        setVideoUrl(`data:video/mp4;base64,${file.data}`);
        addLog("Uğurla tamamlandı.");
      } else {
        addLog("Render xətası! Kod: " + result.code);
      }

    } catch (err: any) {
      addLog(`XƏTA: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#0a0f1a] text-white font-mono">
      <div className="max-w-md w-full bg-[#161d2b] p-8 rounded-3xl border border-blue-500/20 shadow-2xl">
        <h1 className="text-2xl font-black mb-1 text-blue-400 text-center uppercase tracking-tighter italic">Native Engine</h1>
        <p className="text-[9px] text-gray-500 text-center mb-8 tracking-[5px] uppercase font-bold">Trend Music Production</p>
        <form onSubmit={processVideo} className="space-y-6">
          <div className="bg-[#1f293a] p-4 rounded-xl border border-gray-700">
            <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase tracking-widest text-center">Vizual (GIF/Resim)</label>
            <input type="file" name="visual" accept="image/*" className="w-full text-xs text-gray-300" />
          </div>
          <div className="bg-[#1f293a] p-4 rounded-xl border border-gray-700">
            <label className="text-[10px] text-gray-400 block mb-2 font-bold uppercase tracking-widest text-center">Musiqi (MP3)</label>
            <input type="file" name="mp3" accept="audio/mpeg" className="w-full text-xs text-gray-300" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-black tracking-widest uppercase shadow-lg shadow-blue-900/40 transition-all active:scale-95 disabled:opacity-30">
            {loading ? 'HAZIRLANIR...' : 'VİDEONU YARAT'}
          </button>
        </form>
        <div className="mt-8 p-4 bg-black/40 rounded-2xl border border-blue-900/30 min-h-[120px]">
          <p className="text-[10px] text-blue-300 mb-2 font-bold uppercase underline tracking-tighter text-center">Sistem Logları</p>
          <div className="space-y-1 text-center">
            {logs.map((log, i) => <p key={i} className="text-[11px] text-green-400 leading-tight font-light">{log}</p>)}
          </div>
        </div>
        {videoUrl && (
          <div className="mt-8 p-2 bg-[#1f293a] rounded-2xl border border-green-500/20 animate-in fade-in duration-500">
            <video src={videoUrl} controls className="w-full rounded-xl" />
            <a href={videoUrl} download="trend_video.mp4" className="block text-center mt-4 bg-green-600 py-3 rounded-xl font-bold uppercase text-xs">Videonü Telefona Yaz</a>
          </div>
        )}
      </div>
    </main>
  );
}
