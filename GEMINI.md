📱 Video Engine V1.0 - Native Android Renderer
🚀 Layihənin Məqsədi (Missiya)
Bu tətbiqin əsas vəzifəsi, istifadəçinin seçdiyi bir MP3 (musiqi) faylı ilə bir Vizual (GIF və ya Şəkil) faylını birləşdirərək, sosial media (xüsusilə YouTube) üçün yüksək keyfiyyətli MP4 videoları hazırlamaqdır. Ən böyük üstünlüyü, render prosesini brauzerdə deyil, birbaşa telefonun Native (doğma) prosessor gücü ilə saniyələr içində etməsidir.
🛠 Texnoloji Stek (Nə istifadə etdik?)
Next.js (React) + TypeScript: Tətbiqin interfeysi (UI) və məntiqi üçün.
Tailwind CSS: Müasir və qaranlıq (Dark Mode) dizayn üçün.
Capacitor.js: Veb tətbiqi (Next.js) Android APK-ya çevirən körpü.
@capgo/capacitor-ffmpeg (Native Engine): Videonu emal edən əsas mühərrik. Bu, brauzer yaddaşından (RAM) asılı deyil, birbaşa Android-in C++ kitabxanalarını işlədir.
@capacitor/filesystem: Telefonun daxili yaddaşında faylları idarə etmək üçün.
GitHub Actions: Android Studio-nu qurmadan, buludda (Ubuntu serverlərində) avtomatik APK hazırlamaq üçün (CI/CD).
⚙️ İş Mexanizmi (Necə çalışır?)
1. Faylların Qəbulu
İstifadəçi tətbiq daxilində bir şəkil/GIF və bir MP3 seçir.
2. Müvəqqəti Yaddaşa Yazma (Cache)
Seçilən fayllar Android-in Cache (müvəqqəti) qovluğuna yazılır. Bu, telefonun əsas yaddaşını (qalereyanı) zibilləməmək üçün ən təhlükəsiz yoldur. Tətbiq bağlandıqda sistem bu faylları təmizləyə bilir.
3. Native Render Prosesi
Aşağıdakı FFmpeg komandası Native mühərrik tərəfindən icra olunur:
FPS=24: Standart film sürəti.
Scale=720p/1080p: Yüksək keyfiyyət.
Preset=Ultrafast: Prosessoru ən sürətli rejimə salır.
Native Engine: Bu proses ffmpeg.wasm (brauzer versiyası) ilə müqayisədə 10-15 dəfə daha sürətlidir.
4. Nəticə və Endirmə
Hazır olan MP4 faylı Base64 formatında oxunur və istifadəçiyə "Videonü Telefona Yaz" düyməsi ilə təqdim olunur.
🏗 Build Prosesi (Harada hazırlanır?)
Bu APK-nı hazırlamaq üçün sənin komputerinin gücündən istifadə etmirik. Proses tamamilə GitHub Actions üzərində gedir:
Push: Sən kodu GitHub-a göndərirsən.
Virtual Machine: GitHub bir Ubuntu serveri açır.
Environment: İçində Node.js 22, Java 21 və Android SDK quraşdırılır.
Gradle Build: Android layihəsi (Java/C++ kodları) və Next.js (Veb kodları) bir qutuya (APK) yığılır.
Artifacts: Build bitəndə sənə endirilə bilən .zip faylı içində APK təqdim olunur.
⚡️ Render Xüsusiyyətləri
GIF Dəstəyi: GIF-lər mahnının sonuna qədər sonsuz dövr (loop) edilir.
Şəkil Dəstəyi: JPG/PNG faylları mahnı bitənə qədər sabit kadr kimi dondurulur.
Səs Keyfiyyəti: MP3-ün orijinal keyfiyyəti qorunur (-c:a copy).
Sürət: 3 dəqiqəlik bir mahnı üçün video cəmi 15-25 saniyə ərzində hazır olur.
🛠 Gələcəkdə Nə Əlavə Oluna Bilər?
Videoya mətni (Text/Lyrics) əlavə etmək.
Videonun künclərinə "Watermark" qoymaq.
Çoxlu şəkil seçib slayd-şou yaratmaq.
Layihə Sahibi: LolHubFun / Trend Music Production
Tarix: 2026-cı il, Yanvar
Status: Stabil Native APK (V1.0)
