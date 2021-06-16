import React, {useEffect, useState} from 'react';
import {Button, InputLabel, MenuItem, Select, Switch, TextField} from '@material-ui/core';


const Notes = ({notes}) => {
    const audioContext = new AudioContext();
    const oscillatorNotes = notes.map((note, index) => {
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
        newOscillator.start();
        return { oscillator: newOscillator, gainNode, id: note.name };
    });

    const initalDistortions = [
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

    const [distortions, setDistortions] = useState(initalDistortions);
    const [sustain, setSustain] = useState(9);
    const [arpeggiatorFrequency, setArpeggiatorFrequency] = useState(4);
    const [arpeggiatorOn, setArpeggiatorOn] = useState(false);
    const [arpeggiatorReference, setArpeggiatorReference] = useState([]);


    const handleSetSustain = (d) => {
        setSustain(+d.target.value);
    }

    const handleUpdateDistortionFrequencyOffset = (d) => {
        const newDistortions = distortions.map(dist => {
            if (dist.id === +d.target.id) {
                return {...dist, frequencyOffset: +d.target.value}
            }
            return dist;
        });
        setDistortions(newDistortions);
    };

    const handleUpdateType = (d) => {
        const newDistortions = distortions.map(dist => {
            if (dist.id === +d.target.name) {
                return {...dist, type: d.target.value}
            }
            return dist;
        });
        setDistortions(newDistortions);
    };

    const handleUpdateOn = (d) => {
        const newDistortions = distortions.map(dist => {
            if (dist.id === +d.target.name) {
                return {...dist, on: !dist.on}
            }
            return dist;
        });
        setDistortions(newDistortions);
    };

    const createNote = (note) => {
        // console.log('create note', arpeggiatorReference);
        const gainNode = audioContext.createGain();
        gainNode.gain.value = 0.0001;
        gainNode.connect(audioContext.destination);
        const newOscillator = audioContext.createOscillator();
        newOscillator.type = 'sine';
        newOscillator.frequency.value = note.frequency;
        newOscillator.connect(gainNode);
        newOscillator.start();

        // add some noise
        distortions.forEach((d, index) => {
            const noiseOscillators = [];
            if(d.on === true) {
                noiseOscillators.push(audioContext.createOscillator());
                noiseOscillators[noiseOscillators.length -1].type = d.type;
                noiseOscillators[noiseOscillators.length -1].frequency.value = note.frequency + d.frequencyOffset;
                noiseOscillators[noiseOscillators.length -1].connect(gainNode);
                noiseOscillators[noiseOscillators.length -1].start();
                noiseOscillators[noiseOscillators.length -1].stop(audioContext.currentTime + sustain + 1);
            }
        });
        gainNode.gain.exponentialRampToValueAtTime(0.4, audioContext.currentTime );
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + sustain);
        newOscillator.stop(audioContext.currentTime + sustain + 1);
    }

    const startNote = (note) => {
        const oscillatorNote = oscillatorNotes.find((on) => on.id === note.name);
        oscillatorNote.gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        oscillatorNote.gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 1.9);
    }

    const stopNote = (note) => {
        console.log('stop note', arpeggiatorReference);
        arpeggiatorReference.forEach(arf => {
            console.log('clear', arf);
            clearInterval(arf);
        });

        // const oscillatorNote = oscillatorNotes.find((on) => on.id === note.name);
        // oscillatorNote.gainNode.gain.value = 0;
        // oscillatorNote.gainNode.gain.setValueAtTime(0.001, audioContext.currentTime + 1);
    }

    const handleCreateNote = (note) => {
            console.log(arpeggiatorOn, arpeggiatorFrequency);
            if (arpeggiatorOn && arpeggiatorFrequency > 0) {
                console.log('setarpeggiator');
                const ref = window.setInterval(createNote, 250, note);
                console.log(ref);
                const newreferences = [...arpeggiatorReference, ref];
                console.log(newreferences);
                setArpeggiatorReference(newreferences);
            } else {
                createNote(note);
            }
    }


    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.repeat) { return }
            console.log('handle keypress');
            const note = notes.find((n) => n.key === e.key);
            if (note) {
                handleCreateNote(note);
            }
        }

        const handleKeyUp = (e) => {
            console.log('handle keyup');
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
    <div>
        <TextField
            label="Sustain"
            name={'sustain'}
            id={'sustain'}
            value={sustain}
            onChange={handleSetSustain}
            inputProps={{
            step: 1,
            min: 1,
            max: 25,
            type: 'number',
        }}/>
        <h2>Distortions</h2>

        {distortions.map((distorter, index) => (<>
            <>
                <TextField
                    label="Frequency offset"
                    value={distorter.frequencyOffset}
                    name={'Frequency offset'}
                    id={distorter.id.toString()}
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
                    id={distorter.id.toString()}
                    name={distorter.id.toString()}
                    value={distorter.type}
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
                        checked={distorter.on}
                        onChange={handleUpdateOn}
                        name={distorter.id.toString()}
                        inputProps={{ 'aria-label': 'secondary checkbox' }}
                    />
                </div>
            </>
            ))}
    {notes.map(note =>
        <Button variant="outlined" onMouseDown={() => handleCreateNote(note)} onMouseUp={() => stopNote(note)} onMouseLeave={() => stopNote(note)} name={note.name} value={note.name}>{note.name}</Button>
        )}
    </div>);
};
export default Notes;
