import React from 'react';
import Drum from './Drum';

const Drums = ({}) => {
    const drums = [
        {
            frequency: 6.35,
            name: 'Snare',
            type: 'snare',
            key: 'snare',
        },
        {
            frequency: 6.35,
            name: 'Base',
            type: 'base',
            key: 'base',
        }];
    return drums.map(drum => (<Drum key={`drum_${drum.name}`} drum={drum}></Drum>));
};

export default Drums;
