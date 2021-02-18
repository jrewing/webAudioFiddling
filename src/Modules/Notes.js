import React, {useEffect, useState} from 'react';
import {Button} from '@material-ui/core';
import {getOscillator} from '../libraries/webAudio2';


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

    const startNote = (note) => {
        const oscillatorNote = oscillatorNotes.find((on) => on.id === note.name);
        console.log(oscillatorNote);
        oscillatorNote.gainNode.gain.value = 0.4;
    }

    const stopNote = (note) => {
        console.log(note);
        const oscillatorNote = oscillatorNotes.find((on) => on.id === note.name);
        oscillatorNote.gainNode.gain.value = 0;
    }

    return (
    <div>
    {notes.map(note =>
        <Button onMouseDown={() => startNote(note)} onMouseUp={() => stopNote(note)} onMouseLeave={() => stopNote(note)} name={note.name} value={note.name}>{note.name}</Button>
        )}
    </div>);
};
export default Notes;
