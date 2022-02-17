import React, {useEffect} from 'react';
import {useState} from '@hookstate/core';
import {Button, InputLabel, MenuItem, Select, Switch, TextField} from '@material-ui/core';

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
    const octave = useState(4);

    const initialDistortions = [
        {
            id: 0,
            frequencyOffset: 100,
            on: false,
            gainOffset: 0,
            type: 'square',
        },
        {
            id: 1,
            frequencyOffset: -100,
            on: false,
            gainOffset: 0,
            type: 'square',
        },
        {
            id: 2,
            frequencyOffset: 50,
            on: false,
            gainOffset: 0,
            type: 'square',
        },
    ];

    const getDistortions = () => {
        const numberOfDistortions = 128;
        let dists = [];
        for (let i = 0; i < numberOfDistortions; i++) {
            dists.push({
                id: i,
                frequencyOffset: Math.floor(Math.random() * 200),
                gainOffset: 0,
                type: 'square',
            })
        }

        return dists;
    }
    const distortions = useState(initialDistortions);
    const predefinedDistortions = useState(getDistortions());
    const sustain = useState(1);
    const reverbOn = useState(false);


    const arpeggiatorFrequency = useState(100);
    const arpeggiatorOn = useState(false);
    const arpeggiatorReference = useState([]);

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

    const handleUpdateDistortionFrequencyOffset = (d) => {
        distortions.find(dist => dist.get().id === +d.target.id && (dist.merge(ds => ({frequencyOffset: +d.target.value})), true));
    };

    const handleUpdateType = (d) => {
        const newDistortions = distortions.map(dist => {
            if (dist.get().id === +d.target.name) {
                dist.merge(ds => ({type: d.target.value}));
            }
        });
    };

    const handleUpdateOn = (d) => {
        const newDistortions = distortions.map(dist => {
            if (dist.get().id === +d.target.name) {
                dist.merge(s => ({on: !s.on}));
            }
        });
    };

    const createDrum = (drum) => {
        console.log('create drum xxx', drum, distortions.get());
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
        distortions.get().forEach((d, index) => {
            const noiseOscillators = [];
            if(d.on === true) {
                noiseOscillators.push(audioContext.createOscillator());
                noiseOscillators[noiseOscillators.length -1].type = d.type;
                noiseOscillators[noiseOscillators.length -1].frequency.value = drum.frequency * Math.pow( octave.get(), 2) + d.frequencyOffset;
                noiseOscillators[noiseOscillators.length -1].connect(gainNode);
                noiseOscillators[noiseOscillators.length -1].start();
                noiseOscillators[noiseOscillators.length -1].stop(audioContext.currentTime + sustain.get() + 1);
            }
        });
        // add some noise
        predefinedDistortions.get().forEach((d, index) => {
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
            if (drum) {
                handleCreateDrum(drum);
            }
        }

        const handleKeyUp = (e) => {
            if (drum) {
                stopDrum(drum);
            }
        }
        window.addEventListener('keydown', handleKeyPress);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []); // Empty array ensures that effect is only run on mount and unmount

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
                gridColumn: '2 / 2',
                gridRow: '1 / 1',
                display:'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(1, 1fr)',
            }}>
                <div style={{
                    gridColumn: 1 / 3,
                    gridRow: '1 / 1',
                }}>
                    <h2>Distortions</h2>
                </div>
                {distortions.map((distorter, index) => (
                    <div key={`drumdist_${index}`} style={{
                        gridColumn: `${index} / ${index}`,
                        gridRow: '2 / 2',
                    }}>
                        <>
                            <TextField
                                label="Frequency offset"
                                value={distorter.get().frequencyOffset}
                                name={'Frequency offset'}
                                id={distorter.get().id.toString()}
                                onChange={handleUpdateDistortionFrequencyOffset}
                                inputProps={{
                                    step: 2,
                                    min: -1000,
                                    max: 1000,
                                    type: 'number',
                                }}
                            />
                        </>
                        <>
                            <InputLabel id={`wave-type-label-${index}`}>Wave type</InputLabel>
                            <Select
                                labelId="wave-type-label"
                                id={distorter.get().id.toString()}
                                name={distorter.get().id.toString()}
                                value={distorter.get().type}
                                onChange={handleUpdateType}
                            >
                                <MenuItem value={'sine'}>Sine</MenuItem>
                                <MenuItem value={'sawtooth'}>Sawtooth</MenuItem>
                                <MenuItem value={'triangle'}>Triangle</MenuItem>
                                <MenuItem value={'square'}>Square</MenuItem>
                            </Select>
                        </>
                        <div>
                            <Switch
                                checked={distorter.get().on}
                                onChange={handleUpdateOn}
                                name={distorter.get().id.toString()}
                                inputProps={{ 'aria-label': 'secondary checkbox' }}
                            />
                        </div>
                    </div>
                ))}
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
                    <Button
                        variant="outlined"
                        onMouseDown={() => handleCreateDrum(drum)}
                        onMouseUp={() => stopDrum(drum)}
                        onMouseLeave={() => stopDrum(drum)}
                        name={drum.name}
                        value={drum.name}>{drum.name}
                    </Button>

            </div>
            <div id="drum2" style={{
                gridColumn: '2 / 5',
                gridRow: '3 / 3',
            }}>
                <Button
                    variant="outlined"
                    // onClick={() => handleStartWhiteNoise()}
                    name={drum.name}
                    value={drum.name}>{drum.name}
                </Button>

            </div>
        </div>)
};

export default Drum;
