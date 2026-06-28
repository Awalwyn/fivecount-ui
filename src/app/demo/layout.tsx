import { DemoProvider } from '@/components/demo/DemoContext';
import { DemoShell } from '@/components/demo/DemoShell';

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <DemoShell>
        {children}
      </DemoShell>
    </DemoProvider>
  );
}
