

const getOscillator = (id, gainNode, audioContext) => {
    const oscNode = audioContext.createOscillator();
    oscNode.type = "sine";
    oscNode.frequency.value = 261.625565300598634; // middle C
    oscNode.connect(gainNode);
    oscNode.id = +id;
    return oscNode;
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
        console.log(level);
        oscillatorNode.constantNode.offset.value = level;
    }
}

export {startOscillators, stopOscillators, startOscillator, stopOscillator, getOscillator, setOscillatorGain};
