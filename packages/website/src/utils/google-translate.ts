import * as React from 'react';

export function useGoogleTranslation() {
  const [translationOpen, setTranslationOpen] = React.useState<boolean>(false);
  const [init, setInit] = React.useState<boolean>(false);

  const googleTranslateElementInit = () => {
    // eslint-disable-next-line no-new
    new (window as any).google.translate.TranslateElement(
      {
        pageLanguage: 'en',
      },
      'google_translate_element',
    );
  };

  const addScript = () => {
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute(
      'src',
      'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
    );
    document.head.appendChild(script);
    (window as any).googleTranslateElementInit = googleTranslateElementInit;
  };

  React.useEffect(() => {
    if (translationOpen && !init) {
      setInit(true);
      addScript();
    }

    const translationElem = document.getElementById('google_translate_element');

    if (translationOpen && translationElem) {
      translationElem.style.display = 'inline';
    } else if (translationElem) {
      translationElem.style.display = 'none';
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationOpen]);

  return [translationOpen, setTranslationOpen] as [
    boolean,
    React.Dispatch<React.SetStateAction<boolean>>,
  ];
}
