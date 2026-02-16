export const metadata = {
  title: 'Authentication - FiveCount',
  description: 'Sign in to your FiveCount account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-black min-h-screen">
      {children}
    </div>
  );
}
