// Mock para react-native-worklets (requerido por react-native-reanimated@4 en entorno Jest)
module.exports = {
    useWorklet: jest.fn(),
    runOnUI: jest.fn(),
    runOnJS: jest.fn(),
    makeShareable: jest.fn((v) => v),
    useSharedValue: jest.fn((v) => ({ value: v })),
};
