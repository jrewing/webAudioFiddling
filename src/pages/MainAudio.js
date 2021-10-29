import React from 'react';
import { createState, useState } from '@hookstate/core';
import { getOscillator } from '../libraries/webAudio2';
import OscillatorControl from '../Modules/OscillatorControl';
import Notes from '../Modules/Notes';

const notes = [
    {
        frequency: 16.35,
        name: 'C',
        key: 'c',
    },
    {
        frequency: 17.32,
        name: 'C#',
        key: 'C',
    },
    {
        frequency: 18.35,
        name: 'D',
        key: 'd',
    },
    {
        frequency: 19.45,
        name: 'D#',
        key: 'D',
    },
    {
        frequency: 20.60,
        name: 'E',
        key: 'e',
    },
    {
        frequency: 21.83,
        name: 'F',
        key: 'f',
    },
    {
        frequency: 23.12,
        name: 'F#',
        key: 'F',
    },
    {
        frequency: 24.50,
        name: 'G',
        key: 'g',
    },
    {
        frequency: 25.96,
        name: 'G#',
        key: 'G',
    },
    {
        frequency: 27.5,
        name: 'A',
        key: 'a',
    },
    {
        frequency: 29.14,
        name: 'A#',
        key: 'A',
    },
    {
        frequency: 30.87,
        name: 'B',
        key: 'b',
    },
    {
        frequency: 32.70,
        name: 'C',
        key: 'ç',
    },
];

const oscillatorButtons = [0,1,2];

const globalState = createState({notes, oscillatorButtons});

const MainAudio = (id) => {
    const audioContext = new AudioContext();
    const state = useState(globalState);
    //const [oscillators, setOscillators] = useState([]);

    const initialOscillators = state.oscillatorButtons.get().map((os) => {
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

    const addOscillator = () => {
        state.setOscillatorButtons.merge([...oscillatorButtons, oscillatorButtons.length]);
    }

    const controllers = oscillatorButtons.map((o, index) => {
        return <OscillatorControl id={o} oscillatorNode={initialOscillators[o]} />;
    });

  return <div>
          <h1>Synthetic</h1>
      {(oscillatorButtons.length > 0) && controllers}
      <Notes key={'notes'} notes={state.notes.get()}  />
      {/* <Button onClick={addOscillator}>Legg til oscillator</Button> */}
      </div>
  ;
};

export default MainAudio;
