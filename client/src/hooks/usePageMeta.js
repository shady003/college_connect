import { useEffect } from 'react';

const usePageMeta = (title, favicon) => {
  useEffect(() => {
    // Set page title
    document.title = `${title} | College Connect`;
    
    // Set favicon
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(link);
    }
    link.href = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${favicon}</text></svg>`;
  }, [title, favicon]);
};

export default usePageMeta;