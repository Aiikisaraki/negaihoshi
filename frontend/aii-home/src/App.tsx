import { GlassCard } from './components/GlassCard';
import { Navigation } from './components/Navigation';
import { Timeline } from './components/Timeline';
import { EditorPanel } from './components/EditorPanel';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1 container mx-auto p-6">
        <GlassCard className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-6">星の海の物語</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 功能模块示例 */}
            <Section title="最新动态">
              <Timeline />
            </Section>
            <Section title="创作空间">
              <EditorPanel />
            </Section>
          </div>
        </GlassCard>
      </main>
    </div>
  );
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="p-4 rounded-xl bg-white/5">
    <h2 className="text-xl font-semibold text-pink-300 mb-4">{title}</h2>
    {children}
  </div>
);
