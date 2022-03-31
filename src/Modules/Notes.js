import React, {useEffect} from 'react';
import {Button, InputLabel, MenuItem, Select, Switch, TextField} from '@material-ui/core';
import { useState } from '@hookstate/core';


const Notes = ({notes}) => {
    const octave = useState(4);

    const audioContext = new AudioContext();
    /*
    var convolver = audioContext.createConvolver();
    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    var myArrayBuffer = audioContext.createBuffer(2, audioContext.sampleRate * 3, audioContext.sampleRate);
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
    //source.connect(audioCtx.destination);
    convolver.connect(audioContext.destination);
    // start the source playing
    // source.start();

     */
    const oscillatorNotes = notes.map((note, index) => {
        console.log(note.name);
        let gainNode = audioContext.createGain();
        gainNode.gain.value = 0;
        /*
        I could not make this work.
        let constantNode = audioContext.createConstantSource();
        constantNode.connect(gainNode.gain);
        constantNode.start();
        */
        gainNode.connect(audioContext.destination);
        let newOscillator = audioContext.createOscillator();
        newOscillator.type = 'sine';
        newOscillator.frequency.value = note.frequency;
        newOscillator.connect(gainNode);
        // newOscillator.connect(convolver);
        // newOscillator.start();
        return { oscillator: newOscillator, gainNode, id: note.name };
    });

    const initialDistortions = [
        {
            id: 0,
            frequencyOffset: 1,
            on: false,
            gainOffset: 0,
            type: 'square',
        },
        {
            id: 1,
            frequencyOffset: -1,
            on: false,
            gainOffset: 0,
            type: 'square',
        },
        {
            id: 2,
            frequencyOffset: 10,
            on: false,
            gainOffset: 0,
            type: 'square',
        },
    ];
    const distortions = useState(initialDistortions);
    const sustain = useState(7);


    const arpeggiatorFrequency = useState(100);
    const arpeggiatorOn = useState(false);
    const arpeggiatorReference = useState([]);

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

    const createNote = (note) => {
        console.log('create note', note, distortions.get());
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.0001;
        gainNode.connect(audioContext.destination);
        const newOscillator = audioContext.createOscillator();
        newOscillator.type = 'sine';
        newOscillator.frequency.value = note.frequency * Math.pow( 2, octave.get());
        console.log(note.frequency, octave.get(), note.frequency * Math.pow(  2, octave.get()));
        newOscillator.connect(gainNode);
        //newOscillator.connect(convolver);
        newOscillator.start();

        // add some noise
        distortions.get().forEach((d, index) => {
            const noiseOscillators = [];
            if(d.on === true) {
                noiseOscillators.push(audioContext.createOscillator());
                noiseOscillators[noiseOscillators.length -1].type = d.type;
                noiseOscillators[noiseOscillators.length -1].frequency.value = note.frequency * Math.pow( octave.get(), 2) + d.frequencyOffset;
                noiseOscillators[noiseOscillators.length -1].connect(gainNode);
                noiseOscillators[noiseOscillators.length -1].start();
                noiseOscillators[noiseOscillators.length -1].stop(audioContext.currentTime + sustain.get() + 1);
            }
        });
        gainNode.gain.exponentialRampToValueAtTime(0.4, audioContext.currentTime );
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + sustain.get());
        newOscillator.stop(audioContext.currentTime + sustain.get() + 1);
    }

    const startNote = (note) => {
        const oscillatorNote = oscillatorNotes.find((on) => on.id === note.name);
        oscillatorNote.gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        oscillatorNote.gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1.9);
    }

    const stopNote = (note) => {
        console.log('stop note', arpeggiatorReference);
        arpeggiatorReference.forEach(arf => {
            console.log('clear', arf.get());
            clearInterval(arf.get());
        });
    }

    const handleCreateNote = (note) => {
            if (arpeggiatorOn.get() && arpeggiatorFrequency.get() > 0) {
                createNote(note);
                const ref = window.setInterval(createNote, arpeggiatorFrequency.get(), note);
                arpeggiatorReference.merge([ref]);
            } else {
                createNote(note);
            }
    }


    useEffect(() => {
        const handleKeyPress = (e) => {
            console.log('NOTES Keypress', e.key);
            let note = false;
            if (e.repeat) { return }
            if (['0','1','2','3','4','5','6','7','8','9'].includes(e.key)) {
                console.log('space equals 0?');
                note = notes[+e.key];
            } else {
                note = notes.find((n) => n.key === e.key);
            }
            if (note) {
                handleCreateNote(note);
            }
        }

        const handleKeyUp = (e) => {
            const note = notes.find((n) => n.key === e.key);
            if (note) {
                stopNote(note);
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
            border: '1px solid red',
        }}>
        <div style={{
            gridColumn: '1 / 1',
            gridRow: '1 / 1',
            border: '1px solid aqua',
        }}>
        <TextField
            label="Sustain"
            name={'sustain'}
            id={'sustain'}
            value={sustain.get()}
            onChange={handleSetSustain}
            inputProps={{
            step: 1,
            min: 1,
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
            border: '1px sold blue',
        }}>
        <div style={{
            gridColumn: 1 / 3,
            gridRow: '1 / 1',
        }}>
            <h2>Distortions</h2>
        </div>
        {distortions.map((distorter, index) => (
            <div style={{
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
                        step: 0.5,
                        min: -10,
                        max: 10,
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
            <InputLabel id={'areggiator-toggle'}>Arpeggiator</InputLabel>
            <Switch
                labelId={'areggiator-toggle'}
                checked={arpeggiatorOn.get()}
                onChange={handleUpdateArpeggiatorOn}
                inputProps={{ 'aria-label': 'secondary checkbox' }}
            />
            <TextField
                label="Arpeggiator frequency"
                value={arpeggiatorFrequency.get()}
                name={'Frequency offset'}
                id={'arpeggiatorFrequency-input'}
                onChange={handleUpdateArpeggiatorFrequency}
                inputProps={{
                    step: 10,
                    min: 100,
                    max: 5000,
                    type: 'number',
                }}
            />
        </div>
        <div style={{
            gridColumn: '4 / 4',
            gridRow: '1 / 1',
        }}>
        <InputLabel id={'octaves'}>Octaves</InputLabel>
        <TextField
            labelId="octaves"
            id="select-octaves"
            value={octave.get()}
            onChange={handleOctaveChange}
            inputProps={{
                step: 1,
                min: 1,
                max: 24,
                type: 'number',
            }}
        >
            <MenuItem value={0}>{0}</MenuItem>
            <MenuItem value={1}>{1}</MenuItem>
            <MenuItem value={2}>{2}</MenuItem>
            <MenuItem value={3}>{3}</MenuItem>
            <MenuItem value={4}>{4}</MenuItem>
        </TextField>
        </div>
    <div id="notes" style={{
        gridColumn: '1 / 5',
        gridRow: '3 / 3',
    }}>
        {notes.map(note =>
            <Button
                variant="outlined"
                onMouseDown={() => handleCreateNote(note)}
                onMouseUp={() => stopNote(note)}
                onMouseLeave={() => stopNote(note)}
                name={note.name}
                value={note.name}>{note.name}
            </Button>
        )}
    </div>
    </div>
);
};
export default Notes;
