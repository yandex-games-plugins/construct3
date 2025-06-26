const SDK = globalThis.SDK;

const PLUGIN = {
    ID: 'yagames_sdk',
    CATEGORY: 'platform-specific',
};

SDK.Plugins.yagames_sdk = class YandexGamesSDK extends SDK.IPluginBase {
    constructor() {
        super(PLUGIN.ID);

        SDK.Lang.PushContext('plugins.' + PLUGIN.ID.toLowerCase());

        this._info.SetName(globalThis.lang('.name'));
        this._info.SetDescription(globalThis.lang('.description'));
        this._info.SetCategory(PLUGIN.CATEGORY);
        this._info.SetAuthor('Yandex');
        this._info.SetHelpUrl(globalThis.lang('.help-url'));
        this._info.SetIsSingleGlobal(true);

        // Set the domSide.js script to run in the context of the DOM
        this._info.SetDOMSideScripts(['c3runtime/domSide.js']);

        this._info.AddFileDependency({
            filename: 'deps/block_selection.css',
            type: 'external-css',
        });

        this._info.AddFileDependency({
            filename: 'deps/tv_emulator.html',
            type: 'copy-to-output',
            fileType: 'text/html',
        });

        SDK.Lang.PushContext('.properties');

        this._info.SetProperties([
            new SDK.PluginProperty('text', 'default-localization-language', 'en'),
            new SDK.PluginProperty('check', 'automatic-initialization', true),
            new SDK.PluginProperty('integer', 'metrika-counter-id', 0),
        ]);

        SDK.Lang.PopContext();

        SDK.Lang.PopContext();
    }
};

SDK.Plugins.yagames_sdk.Register(PLUGIN.ID, SDK.Plugins.yagames_sdk);
