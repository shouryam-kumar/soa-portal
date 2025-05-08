import { usePathname } from 'next/navigation';

// Add this component to your main App or Layout file
export function MainLayout({ children }) {
  const pathname = usePathname();
  
  // Check if the current path is an admin page
  const isAdminPage = pathname?.startsWith('/admin');
  
  // Hide the main sidebar on admin pages
  if (isAdminPage) {
    return <>{children}</>;
  }
  
  // Regular layout with sidebar for non-admin pages
  return (
    <div className="app-layout">
      {/* Regular sidebar goes here */}
      <main>{children}</main>
    </div>
  );
} 