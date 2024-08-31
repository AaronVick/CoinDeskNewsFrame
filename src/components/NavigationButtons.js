import React, { useState } from 'react';
import NavigationButtons from './NavigationButtons';
import fetchRSS from '../utils/fetchRSS';

const Frame = () => {
    const [currentCategory, setCurrentCategory] = useState('top'); // Set initial category
    const [currentIndex, setCurrentIndex] = useState(0);
    const [article, setArticle] = useState(null);

    const loadArticle = async (category, index) => {
        const result = await fetchRSS(category);
        if (result && result.articles && result.articles[index]) {
            setArticle(result.articles[index]);
            setCurrentIndex(index);
            setCurrentCategory(category);
        }
    };

    const handleNext = () => {
        loadArticle(currentCategory, currentIndex + 1);
    };

    const handleBack = () => {
        loadArticle(currentCategory, currentIndex - 1);
    };

    const handleHome = () => {
        loadArticle('top', 0); // Default to 'top' category on Home
    };

    React.useEffect(() => {
        loadArticle(currentCategory, currentIndex);
    }, []);

    return (
        <div>
            {article && (
                <>
                    <img src={article.thumbnail || 'default-placeholder.png'} alt={article.title} />
                    <h1>{article.title}</h1>
                    <NavigationButtons
                        onBack={handleBack}
                        onNext={handleNext}
                        articleUrl={article.link}
                        onHome={handleHome}
                    />
                </>
            )}
        </div>
    );
};

export default Frame;
