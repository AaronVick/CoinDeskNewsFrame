import React, { useState } from 'react';
import Header from './Header';
import NavigationButtons from './NavigationButtons';

const Frame = ({ articles, onHome }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const defaultImage = '/trending-news-placeholder.png';

  const handleNavigation = (direction) => {
    if (direction === 'next' && currentIndex < articles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (direction === 'back' && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const currentArticle = articles[currentIndex] || {};
  const imageUrl = currentArticle.imageUrl || defaultImage;

  return (
    <div>
      <Header 
        headline={currentArticle.title || 'No title available'} 
        imageUrl={imageUrl}
      />
      <NavigationButtons 
        onBack={() => handleNavigation('back')}
        onNext={() => handleNavigation('next')}
        articleUrl={currentArticle.url || '#'}
        onHome={onHome}
      />
    </div>
  );
};

export default Frame;