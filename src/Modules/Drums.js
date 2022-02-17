import React from 'react';
import Drum from './Drum';

const Drums = ({}) => {
    const drum =
        {
            frequency: 6.35,
            name: 'C',
            key: 'c',
        };
    return (<Drum key={`drum_${drum.name}`} drum={drum}></Drum>);
};

export default Drums;
