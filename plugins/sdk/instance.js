const SDK = globalThis.SDK;

SDK.Plugins.yagames_sdk.Instance = class YandexGamesSDKInstance extends SDK.IInstanceBase {
    LoadC2Property() {
        return false; // not handled
    }
};
