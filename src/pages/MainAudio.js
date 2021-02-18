import React, {useState} from 'react';
import { getOscillator } from '../libraries/webAudio2';
import {Button} from '@material-ui/core';
import OscillatorControl from '../Modules/OscillatorControl';

const MainAudio = (id) => {
    const audioContext = new AudioContext();
    const gainNode1 = audioContext.createGain();
    gainNode1.gain.value = 0.5;

    const gainNode2 = audioContext.createGain();
    const gainNode3 = audioContext.createGain();
    gainNode2.gain.value = gainNode1.gain.value;
    gainNode3.gain.value = gainNode1.gain.value;
// volumeControl.value = gainNode1.gain.value;

    const constantNode = audioContext.createConstantSource();
    constantNode.connect(gainNode2.gain);
    constantNode.connect(gainNode3.gain);
    constantNode.start();

    gainNode1.connect(audioContext.destination);
    gainNode2.connect(audioContext.destination);
    gainNode3.connect(audioContext.destination);



    //const [oscillators, setOscillators] = useState([]);
    const [oscillatorButtons, setOscillatorButtons] = useState([0,1,2]);

    const initialOscillators = oscillatorButtons.map((os) => {
            console.log('for of oscb', os);
            const gainNode = audioContext.createGain();
            gainNode.gain.value = 0.5;
            const constantNode = audioContext.createConstantSource();
            constantNode.connect(gainNode.gain);
            gainNode.connect(audioContext.destination);

            const newOscillator = getOscillator(os, gainNode, audioContext);

            return { oscillator: newOscillator, constantNode: constantNode, id: os };
        });


    const addOscillator = () => {
        setOscillatorButtons([...oscillatorButtons, oscillatorButtons.length]);
    }

    const controllers = oscillatorButtons.map((o, index) => {
        console.log(o);
        return <OscillatorControl id={o} oscillatorNode={initialOscillators[o]} />;
        // return (<p>o</p>);
    });
    console.log(controllers);
  return <div>
          <h1>Synthetic</h1>
      {(oscillatorButtons.length > 0) && controllers}
      <Button onClick={addOscillator}>Legg til oscillator</Button>
      </div>
  ;
};

export default MainAudio;
