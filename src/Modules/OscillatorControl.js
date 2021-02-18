import React, {useEffect, useState} from 'react';
import { startOscillator, setOscillatorGain } from '../libraries/webAudio2';
import {Button, Slider} from '@material-ui/core';

const OscillatorControl = ({id, oscillatorNode}) => {
    console.log(id);
    const [gain, setGain] = useState(0);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        setOscillatorGain(oscillatorNode, gain);
    }, [gain]);

    const handleStartOscillator = (e, id) => {
        console.log('id', id);
        if (started === false) {
            startOscillator(oscillatorNode);
            setGain(0.5);
            setStarted(true);
        } else {
            setGain(0.5);
        }
    }

    const handleStopOscillator = (e, index) => {
        // stopOscillator(oscillator);
        setGain(0);
    }

    const handleGainChange = name => (e, value) => {
        setGain(value);
    };

    return (<div key={id}>
        <Button name={`gain_${id}`} value={id} onClick={(e) => handleStartOscillator(e, id)}>Start {id}</Button>
        <Button name={`gain_${id}`} value={id} onClick={(e) => handleStopOscillator(e, id)}>Stop {id}</Button>
        <Slider name={`gain_${id}`} defaultValue={1} min={0} max={1} value={gain} step={0.0001}  onChange={handleGainChange(`gain_${id}`)} type="slider">Volume</Slider>
            </div>)
    ;
};

export default OscillatorControl;
