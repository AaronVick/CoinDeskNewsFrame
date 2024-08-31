import React, { useState } from 'react';
import styles from './Header.module.css';

const DEFAULT_IMAGE = '/default-placeholder.png';

const Header = ({ headline, imageUrl }) => {
    const [imgSrc, setImgSrc] = useState(imageUrl);

    const handleImageError = () => {
        setImgSrc(DEFAULT_IMAGE);
    };

    return (
        <div className={styles.header} style={{ backgroundImage: `url(${imgSrc})` }}>
            <div className={styles.overlay}>
                <h1 className={styles.headline}>{headline}</h1>
            </div>
            <img src={imgSrc} onError={handleImageError} style={{ display: 'none' }} alt="" />
        </div>
    );
};

export default Header;