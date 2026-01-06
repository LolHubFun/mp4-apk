"use client";
import { useState } from 'react';
import { Filesystem, Directory } from '@capacitor/filesystem';

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

    const visualFile = e.target.visual.files[0];
    const mp3 = e.target.mp3.files[0];

    if (!visualFile || !mp3) return alert("Faylları seçin!");

    try {
      addLog("Native mühərrik hazırlanır...");

      // Faylı Base64-ə çevirib Cache-ə yazmaq
      const writeToCache = async (file: File, name: string) => {
        const reader = new FileReader();
        return new Promise<string>((resolve) => {
          reader.onload = async () => {
            const base64Data = reader.result?.toString().split(',')[1] || '';
            const path = name;
            await Filesystem.writeFile({
              path,
              data: base64Data,
              directory: Directory.Cache
            });
            const uriResult = await Filesystem.getUri({
              directory: Directory.Cache,
              path
            });
            resolve(uriResult.uri);
          };
          reader.readAsDataURL(file);
        });
      };

      addLog("Fayllar yaddaşa yazılır...");
      const visualUri = await writeToCache(visualFile, 'input_visual');
      const mp3Uri = await writeToCache(mp3, 'input.mp3');
      
      // Çıxış faylının yolu
      const outputResult = await Filesystem.getUri({
        directory: Directory.Cache,
        path: 'output.mp4'
      });
      const outputUri = outputResult.uri;

      addLog("NATIVE RENDER BAŞLADI (1080p)...");
      
      const isGif = visualFile.type === 'image/gif';
      
      // Native FFmpeg Komandası
      const command = isGif
        ? `-ignore_loop 0 -i "${visualUri}" -i "${mp3Uri}" -vf "fps=30,scale=trunc(iw/2)*2:1080" -c:v libx264 -preset superfast -tune stillimage -pix_fmt yuv420p -shortest -y "${outputUri}"`
        : `-loop 1 -i "${visualUri}" -i "${mp3Uri}" -vf "fps=30,scale=trunc(iw/2)*2:1080" -c:v libx264 -preset superfast -tune stillimage -pix_fmt yuv420p -shortest -y "${outputUri}"`;

      // Native FFmpeg-i çağırırıq
      const FFmpegKit = (window as any).FFmpegKit;
      
      if (!FFmpegKit) {
        throw new Error("FFmpeg Native Plugin tapılmadı! APK daxilində yoxlayın.");
      }

      FFmpegKit.execute(command).then(async (session: any) => {
        const state = await session.getState();
        const returnCode = await session.getReturnCode();

        if (returnCode === 0) {
          addLog("Uğurla tamamlandı!");
          const file = await Filesystem.readFile({
            path: 'output.mp4',
            directory: Directory.Cache
          });
          setVideoUrl(`data:video/mp4;base64,${file.data}`);
        } else {
          addLog("Render xətası baş verdi!");
        }
        setLoading(false);
      });

    } catch (err: any) {
      addLog(`XƏTA: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-black text-white font-mono">
      <div className="max-w-md w-full bg-gray-900 p-8 rounded-3xl border border-blue-500/20 shadow-2xl">
        <h1 className="text-2xl font-black mb-1 text-blue-400 text-center uppercase tracking-tighter">Native Engine</h1>
        <p className="text-[9px] text-gray-500 text-center mb-8 tracking-[5px]">FULL HD RENDER</p>
        
        <form onSubmit={processVideo} className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <label className="text-[10px] text-gray-400 block mb-2">VIZUAL (GIF/JPG)</label>
            <input type="file" name="visual" accept="image/*" className="w-full text-xs" />
          </div>
          <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
            <label className="text-[10px] text-gray-400 block mb-2">MAHNI (MP3)</label>
            <input type="file" name="mp3" accept="audio/mpeg" className="w-full text-xs" />
          </div>
          <button disabled={loading} className="w-full bg-blue-600 py-4 rounded-2xl font-black tracking-widest uppercase shadow-lg shadow-blue-900/40 transition-all active:scale-95">
            {loading ? 'PROSESSOR İŞLƏYİR...' : 'VİDEONU YARAT'}
          </button>
        </form>

        <div className="mt-8 p-4 bg-black/50 rounded-2xl border border-blue-900/30 min-h-[100px]">
          {logs.map((log, i) => (
            <p key={i} className="text-[10px] text-green-400 mb-1">{log}</p>
          ))}
          {logs.length === 0 && <p className="text-[10px] text-gray-600">Sistem hazır...</p>}
        </div>

        {videoUrl && (
          <div className="mt-8">
            <video src={videoUrl} controls className="w-full rounded-xl border border-gray-700" />
            <a href={videoUrl} download="native-video.mp4" className="block text-center mt-4 bg-green-600 py-3 rounded-xl font-bold uppercase text-xs">Videonü Telefona Yaz</a>
          </div>
        )}
      </div>
    </main>
  );
}
