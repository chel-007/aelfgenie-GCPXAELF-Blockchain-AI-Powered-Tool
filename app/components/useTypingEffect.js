import { useState, useEffect } from 'react';

const useTypingEffect = (text = '', speed = 50) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (text == null) {
      // Handle the case where text is null or undefined
      return;
    }

    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, index + 1));
      index++;
      if (index === text.length) clearInterval(interval);
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return displayedText;
};

export default useTypingEffect;
