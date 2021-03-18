

const getOscillator = (id, gainNode, audioContext) => {
    let oscNode = audioContext.createOscillator();
    oscNode.type = 'sine';
    oscNode.frequency.value = 261.625565300598634; // middle C
    oscNode.connect(gainNode);
    // oscNode.id = +id;
    return oscNode;
}

const setOscillatorFrequency = (oscillatorNode, frequency) => {
    oscillatorNode.oscillator.frequency.value = +frequency;
}

const setOscillatorType = (oscillatorNode, type) => {
    if (['sine', 'square', 'sawtooth', 'triangle', 'custom'].includes(type)) {
        oscillatorNode.oscillator.type = type;
    }
}

const startOscillators = (oscillatorNodes) => {
    for (const o of oscillatorNodes) {
        o.oscillator.start();
    }
}

const startOscillator = (oscillatorNode) => {
    oscillatorNode.oscillator.start();
}

const stopOscillators = (oscillatorNodes) => {
    for (const on of oscillatorNodes) {
        on.stop();
    }
}

const stopOscillator = (oscillatorNode) => {
    if (oscillatorNode) {
        oscillatorNode.oscillator.stop();
    }
}

const setOscillatorGain = (oscillatorNode, level) => {
    if (oscillatorNode) {
        oscillatorNode.gainNode.gain.value = level;
    }
}

export {startOscillators, stopOscillators, startOscillator, stopOscillator, getOscillator, setOscillatorGain, setOscillatorFrequency, setOscillatorType};
