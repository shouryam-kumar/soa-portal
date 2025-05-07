// Type definitions for Next.js components

export interface PageProps {
  params: {
    [key: string]: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
} 