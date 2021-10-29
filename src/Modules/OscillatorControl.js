import React, {useEffect, useState} from 'react';
import { startOscillator, setOscillatorGain, stopOscillator, setOscillatorFrequency, setOscillatorType } from '../libraries/webAudio2';
import {Button, Slider, Select, MenuItem} from '@material-ui/core';

const OscillatorControl = ({id, oscillatorNode}) => {
    const [gain, setGain] = useState(0);
    const [frequency, setFrequency] = useState(Math.sqrt(261.625565300598634));
    const [type, setType] = useState(oscillatorNode.oscillator.type);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        setOscillatorGain(oscillatorNode, gain);
    }, [gain, oscillatorNode]);
    useEffect(() => {
        setOscillatorFrequency(oscillatorNode, (frequency * frequency));
    }, [frequency, oscillatorNode]);
    useEffect(() => {
        setOscillatorType(oscillatorNode, type);
    }, [type, oscillatorNode]);

    const types = ['sine', 'square', 'sawtooth', 'triangle'];

    const handleStartOscillator = (e, id) => {
        if (started === false) {
            startOscillator(oscillatorNode);
            setGain(0.5);
            setStarted(true);
        } else {
            setGain(0.5);
        }
    }

    const handleStopOscillator = (e, index) => {
        //stopOscillator(oscillatorNode);
        setGain(0);
    }

    const handleGainChange = name => (e, value) => {
        setGain(value);
    };

    const handleFrequencyChange = name => (e, value) => {
        setFrequency(value);
    }

    const handleTypeChange =  (event) => {
        setType(event.target.value);
    }

    return (<div key={id}>
        <Button name={`gain_${id}`} value={id} onClick={(e) => handleStartOscillator(e, id)}>Start</Button>
        <Button name={`gain_${id}`} value={id} onClick={(e) => handleStopOscillator(e, id)}>Stop (mute)</Button>
        <Select
            labelId="`wave_type_${id}`"
            id="`wave_type_${id}`"
            value={type}
            onChange={handleTypeChange}
        >
            {types.map(type => (
                <MenuItem value={type}>{`${type}`}</MenuItem>
            ))
            }
        </Select>
        <Slider name={`gain_${id}`} defaultValue={1} min={0} max={1} value={gain} step={0.0001}  onChange={handleGainChange(`gain_${id}`)} type="slider">Volume</Slider>
        <Slider name={`frequency_${id}`} valueLabelDisplay="off" defaultValue={Math.sqrt(261.625565300598634)} min={0} max={Math.sqrt(13000)} value={frequency} step={0.00001}  onChange={handleFrequencyChange(`frequency_${id}`)} type="slider">Frequency</Slider>
            </div>)
    ;
};

export default OscillatorControl;
