import React, {useEffect, useState} from 'react';
import {useState as useStoredState} from '@hookstate/core';
import {Button, InputLabel, Slider, Switch, TextField, Typography} from '@material-ui/core';

const Drum = ({drum}) => {

    const audioContext = new AudioContext();

    // const handleStartWhiteNoise = () => {
        // var audioCtx = new AudioContext();
        var convolver = audioContext.createConvolver();
        // Create an empty three-second stereo buffer at the sample rate of the AudioContext
        var myArrayBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 1, audioContext.sampleRate);
        // Fill the buffer with white noise;
        // just random values between -1.0 and 1.0
        for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
            // This gives us the actual ArrayBuffer that contains the data
            var nowBuffering = myArrayBuffer.getChannelData(channel);
            for (var i = 0; i < myArrayBuffer.length; i++) {
                // Math.random() is in [0; 1.0]
                // audio needs to be in [-1.0; 1.0]
                nowBuffering[i] = Math.random() * 2 - 1;
            }
        }

        // Get an AudioBufferSourceNode.
        // This is the AudioNode to use when we want to play an AudioBuffer
        var source = audioContext.createBufferSource();
        // set the buffer in the AudioBufferSourceNode
        //source.buffer = myArrayBuffer;
        convolver.buffer = myArrayBuffer;

        // connect the AudioBufferSourceNode to the
        // destination so we can hear the sound
        source.connect(convolver);
        convolver.connect(audioContext.destination);
        // start the source playing
        source.start();

    // };
    const octave = useStoredState(4);

    const [drumOffset, setDrumOffset] = useState(200);
    const [drumScale, setDrumScale] = useState(1000);

    const getDistortions = () => {
        const numberOfDistortions = 128;
        let dists = [];
        for (let i = 0; i < numberOfDistortions; i++) {
            dists.push({
                id: i,
                frequencyOffset: Math.floor(Math.random() * drumScale) + drumOffset,
                gainOffset: 0,
                type: 'square',
            })
        }

        return dists;
    }

    const sustain = useStoredState(1);
    const reverbOn = useStoredState(false);


    const arpeggiatorFrequency = useStoredState(100);
    const arpeggiatorOn = useStoredState(false);
    const arpeggiatorReference = useStoredState([]);

    const handleOffsetChange = (o,v) => {
        setDrumOffset(v);
    }

    const handleScaleChange = (o,v) => {
        setDrumScale(v);
    }

    const handleToggleReverb = () => {
        reverbOn.set(!reverbOn.get());
    }

    const handleUpdateArpeggiatorOn = () => {
        arpeggiatorOn.set(!arpeggiatorOn.get());
    }

    const handleOctaveChange = (o,s) => {
        octave.set(+o.target.value);
    }

    const handleSetSustain = (d) => {
        sustain.set(+d.target.value);
    }

    const handleUpdateArpeggiatorFrequency = (d) => {
        arpeggiatorFrequency.set(+d.target.value);
    }

    const createDrum = (drum) => {
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.0001;
        gainNode.connect(audioContext.destination);
        const newOscillator = audioContext.createOscillator();
        newOscillator.type = 'sine';
        newOscillator.frequency.value = drum.frequency * Math.pow( 2, octave.get());
        console.log(drum.frequency, octave.get(), drum.frequency * Math.pow(  2, octave.get()));
        newOscillator.connect(gainNode);
        if (reverbOn.get() === true) {
            newOscillator.connect(convolver);
        }
        newOscillator.start();

        // add some noise
        getDistortions(drum).forEach((d, index) => {
            console.log(d);
            const noiseOscillators = [];
                noiseOscillators.push(audioContext.createOscillator());
                noiseOscillators[noiseOscillators.length -1].type = d.type;
                noiseOscillators[noiseOscillators.length -1].frequency.value = drum.frequency * Math.pow( octave.get(), 2) + d.frequencyOffset;
                noiseOscillators[noiseOscillators.length -1].connect(gainNode);
                noiseOscillators[noiseOscillators.length -1].start();
                noiseOscillators[noiseOscillators.length -1].stop(audioContext.currentTime + sustain.get() + 1);
        });
        gainNode.gain.exponentialRampToValueAtTime(0.6, audioContext.currentTime );
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + sustain.get());
        newOscillator.stop(audioContext.currentTime + sustain.get() + 1);
    }

    const stopDrum = (drum) => {
        arpeggiatorReference.forEach(arf => {
            clearInterval(arf.get());
        });
    }

    const handleCreateDrum = (drum) => {
        console.log(drum);
        if (arpeggiatorOn.get() && arpeggiatorFrequency.get() > 0) {
            createDrum(drum);
            const ref = window.setInterval(createDrum, arpeggiatorFrequency.get(), drum);
            arpeggiatorReference.merge([ref]);
        } else {
            createDrum(drum);
        }
    }


    useEffect(() => {
        const handleKeyPress = (e) => {
            console.log(e.key);
            if (drum && e.key === ' ') {
                handleCreateDrum(drum);
            }
        }
        const handleKeyUp = (e) => {
            if (drum && e.key === ' ') {
                stopDrum(drum);
            }
        }
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [handleCreateDrum, stopDrum, drum]); // Empty array ensures that effect is only run on mount and unmount

    return (
        <div id="wrapper" style={
            {
                display:'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridTemplateRows: 'repeat(1, 1fr)',
                gridGap: '10px',
            }}>
            <div style={{
                gridColumn: '1 / 1',
                gridRow: '1 / 1',
            }}>
                <TextField
                    label="Sustain"
                    name={'sustain'}
                    id={'drum_sustain'}
                    value={sustain.get()}
                    onChange={handleSetSustain}
                    inputProps={{
                        step: 0.01,
                        min: 0,
                        max: 25,
                        type: 'number',
                    }}/>
            </div>
            <div style={{
                gridColumn: '3 / 3',
                gridRow: '1 / 1',
            }}>
                <InputLabel id={'drum_arpeggiator-toggle'}>Arpeggiator</InputLabel>
                <Switch
                    labelId={'drum_arpeggiator-toggle'}
                    checked={arpeggiatorOn.get()}
                    onChange={handleUpdateArpeggiatorOn}
                    inputProps={{ 'aria-label': 'secondary checkbox' }}
                />
                <TextField
                    label="Arpeggiator frequency"
                    value={arpeggiatorFrequency.get()}
                    name={'Frequency offset'}
                    id={'drum_arpeggiatorFrequency-input'}
                    onChange={handleUpdateArpeggiatorFrequency}
                    inputProps={{
                        step: 10,
                        min: 1,
                        max: 5000,
                        type: 'number',
                    }}
                />
            </div>
            <div>
            <Switch
                checked={reverbOn.get()}
                onChange={handleToggleReverb}
                name={'Reverb'}
                inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
            </div>
            <div id="drum1" style={{
                gridColumn: '1 / 5',
                gridRow: '3 / 3',
            }}>
                <Typography id={'drum-offset'}>
                    Drum offset
                </Typography>
                <Slider
                    aria-label={'Offset'}
                    name={`drum-offset`}
                        defaultValue={50} m
                        in={0}
                        max={1000}
                        value={drumOffset}
                        step={1}
                        onChange={handleOffsetChange}
                        type="slider"
                        valueLabelDisplay='0n'
                >
                    Offset
                </Slider>
                <Typography id={'drum-scale'}>
                    Drum scale
                </Typography>
                <Slider
                    aria-labelledby="drum-scale"
                    aria-label={'Scale'}
                    name={`drum-scale`}
                        defaultValue={50}
                        min={0}
                        max={1000}
                        value={drumScale}
                        step={1}
                        onChange={handleScaleChange}
                        type="slider"
                        valueLabelDisplay='0n'
                    >
                    Offset
                </Slider>

                <Button
                        variant="outlined"
                        onMouseDown={() => handleCreateDrum(drum)}
                        onMouseUp={() => stopDrum(drum)}
                        onMouseLeave={() => stopDrum(drum)}
                        name={drum.name}
                        value={drum.name}>{drum.name}
                    </Button>
            </div>
        </div>)
};

export default Drum;
