import React, {useEffect, useState} from 'react';
import { getOscillator } from '../libraries/webAudio2';
import {Button} from '@material-ui/core';
import OscillatorControl from '../Modules/OscillatorControl';
import Notes from '../Modules/Notes';

const MainAudio = (id) => {
    const audioContext = new AudioContext();

    //const [oscillators, setOscillators] = useState([]);
    const [oscillatorButtons, setOscillatorButtons] = useState([0,1,2]);

    const initialOscillators = oscillatorButtons.map((os) => {
            let gainNode = audioContext.createGain();
            gainNode.gain.value = 0.5;
            /*
            I could not make this work.
            let constantNode = audioContext.createConstantSource();
            constantNode.connect(gainNode.gain);

            constantNode.start();
            */
            gainNode.connect(audioContext.destination);
            let newOscillator = getOscillator(os, gainNode, audioContext);
            newOscillator.connect(gainNode);
            return { oscillator: newOscillator, gainNode, id: os };
        });

    const soundPresets = [
        {
            name: 'constant',
        },
        {
            name: 'fade',
        },
        {
            name: 'sinefade',
        }
        ];

    const notes = [
        {
            frequency: 261.63,
            name: 'C4',
            key: 'c',
        },
        {
            frequency: 277.18,
            name: 'C#4',
            key: 'C',
        },
        {
            frequency: 293.66,
            name: 'D4',
            key: 'd',
        },
        {
            frequency: 311.13,
            name: 'D#4',
            key: 'D',
        },
        {
            frequency: 329.63,
            name: 'E4',
            key: 'e',
        },
        {
            frequency: 349.23,
            name: 'F4',
            key: 'f',
        },
        {
            frequency: 369.99,
            name: 'F#4',
            key: 'F',
        },
        {
            frequency: 392.00,
            name: 'G4',
            key: 'g',
        },
        {
            frequency: 415.30,
            name: 'G#4',
            key: 'G',
        },
        {
            frequency: 440.00,
            name: 'A4',
            key: 'a',
        },
        {
            frequency: 466.16,
            name: 'A#4',
            key: 'A',
        },
        {
            frequency: 493.88,
            name: 'B4',
            key: 'b',
        },
        {
            frequency: 523.25,
            name: 'C5',
            key: 'ç',
        },
    ]


    const addOscillator = () => {
        setOscillatorButtons([...oscillatorButtons, oscillatorButtons.length]);
    }

    const controllers = oscillatorButtons.map((o, index) => {
        return <OscillatorControl id={o} oscillatorNode={initialOscillators[o]} />;
    });


  return <div>
          <h1>Synthetic</h1>
      {(oscillatorButtons.length > 0) && controllers}
      <Notes notes={notes} />
      {/* <Button onClick={addOscillator}>Legg til oscillator</Button> */}
      </div>
  ;
};

export default MainAudio;
