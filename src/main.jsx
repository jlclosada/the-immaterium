import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { ToastProvider } from './components/Admin/Toast';
import ErrorBoundary from './components/UI/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min — data stays fresh
      gcTime: 1000 * 60 * 30,         // 30 min — keep in memory
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Global image fade-in: add .loaded class when any <img> finishes loading
document.addEventListener('load', (e) => {
  if (e.target && e.target.tagName === 'IMG') {
    e.target.classList.add('loaded');
    // If already loaded (cached), the load event may not fire — handle below
  }
}, true);

// Mark already-complete images on DOM changes (handles cached / fast-loading images)
const markLoadedImages = () => {
  document.querySelectorAll('img').forEach(img => {
    if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
  });
};
// Run once immediately and on every React re-render cycle via MutationObserver
markLoadedImages();
new MutationObserver(markLoadedImages).observe(document.body || document.documentElement, {
  childList: true, subtree: true,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <ToastProvider>
              <App />
            </ToastProvider>
          </ErrorBoundary>
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
