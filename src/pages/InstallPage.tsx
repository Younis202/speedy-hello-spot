import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Download, Monitor, Smartphone, CheckCircle, Command } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPage = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-12 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-primary flex items-center justify-center shadow-2xl glow-sm">
            <Command className="w-12 h-12 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold mb-4">
            ثبّت <span className="text-gradient">Control Room</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            احصل على تجربة أفضل بتثبيت التطبيق على جهازك
          </p>
        </div>

        {/* Status Card */}
        {isInstalled ? (
          <div className="card-elegant p-8 text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/15 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-success mb-2">التطبيق مثبّت!</h2>
            <p className="text-muted-foreground">
              يمكنك فتح Control Room من سطح المكتب أو شاشة البداية
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Install Button (Chrome/Edge) */}
            {deferredPrompt && (
              <div className="card-elegant p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/15 flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-bold mb-3">ثبّت على الكمبيوتر</h2>
                <p className="text-muted-foreground mb-6">
                  اضغط الزرار ده وهيتثبت التطبيق على جهازك
                </p>
                <Button 
                  onClick={handleInstall}
                  size="lg"
                  className="bg-gradient-primary hover:opacity-90 shadow-lg shadow-primary/20"
                >
                  <Download className="w-5 h-5 ml-2" />
                  تثبيت Control Room
                </Button>
              </div>
            )}

            {/* Manual Instructions */}
            <div className="card-elegant p-8">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                طريقة التثبيت اليدوية
              </h3>
              
              <div className="space-y-6">
                {/* Chrome */}
                <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                  <h4 className="font-semibold mb-3">Chrome / Edge</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                      <span>افتح القائمة (⋮) في أعلى المتصفح</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                      <span>اختار "Install Control Room" أو "تثبيت التطبيق"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                      <span>اضغط "Install" وهيظهر على سطح المكتب</span>
                    </li>
                  </ol>
                </div>

                {/* Safari (iOS) */}
                {isIOS && (
                  <div className="p-4 rounded-xl bg-secondary/30 border border-border/50">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Safari (iPhone/iPad)
                    </h4>
                    <ol className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">1</span>
                        <span>اضغط على زرار المشاركة (⬆️)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">2</span>
                        <span>اختار "Add to Home Screen"</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">3</span>
                        <span>اضغط "Add" وهيظهر على الشاشة الرئيسية</span>
                      </li>
                    </ol>
                  </div>
                )}
              </div>
            </div>

            {/* Benefits */}
            <div className="card-elegant p-8">
              <h3 className="text-lg font-bold mb-6">ليه تثبّت التطبيق؟</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: 'وصول سريع', desc: 'افتح التطبيق من أيقونة على سطح المكتب' },
                  { title: 'يشتغل Offline', desc: 'استخدم التطبيق حتى لو مفيش نت' },
                  { title: 'تجربة أفضل', desc: 'شاشة كاملة بدون شريط المتصفح' },
                  { title: 'أسرع', desc: 'التطبيق بيحمّل أسرع بكتير' },
                ].map((item, i) => (
                  <div key={i} className="p-4 rounded-xl bg-secondary/20 border border-border/30">
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default InstallPage;
