module.exports = function (api) {
    api.cache.using(() => process.env.NODE_ENV);

    const isTest = process.env.NODE_ENV === 'test';

    return {
        presets: [
            [
                'babel-preset-expo',
                {
                    // El plugin de reanimated requiere react-native-worklets que
                    // no está disponible en el entorno de Jest (Node.js puro).
                    reanimated: !isTest,
                },
            ],
        ],
    };
};
