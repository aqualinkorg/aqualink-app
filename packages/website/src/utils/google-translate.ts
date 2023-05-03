import React from 'react';

export function useGoogleTranslation() {
  const [translationOpen, setTranslationOpen] = React.useState<number>(0);

  const googleTranslateElementInit = () => {
    // eslint-disable-next-line no-new
    new (window as any).google.translate.TranslateElement({
      pageLanguage: 'en',
    });
  };

  const addScript = () => {
    const script = document.createElement('script');
    script.setAttribute(
      'src',
      '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit',
    );
    document.head.appendChild(script);
    // eslint-disable-next-line fp/no-mutation
    (window as any).googleTranslateElementInit = googleTranslateElementInit;
  };

  React.useEffect(() => {
    if (translationOpen !== 0) addScript();

    return () => {
      // eslint-disable-next-line fp/no-mutation
      document.getElementsByTagName('body')[0].style.top = '0px';
      const collection = document.getElementsByClassName('skiptranslate');
      // eslint-disable-next-line fp/no-mutation
      for (let i = 0; i < collection.length; i += 1) {
        collection[i].remove();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translationOpen]);

  return [translationOpen, setTranslationOpen] as [
    number,
    React.Dispatch<React.SetStateAction<number>>,
  ];
}
