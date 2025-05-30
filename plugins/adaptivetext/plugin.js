const SDK = self.SDK;

const PLUGIN = {
    ID: 'yagames_adaptivetext',
    VERSION: '1.3.0',
    CATEGORY: 'general',
};

let app = null;

const PLUGIN_CLASS = (SDK.Plugins.yagames_adaptivetext = class AdaptiveTextPlugin extends SDK.IPluginBase {
    constructor() {
        super(PLUGIN.ID);

        SDK.Lang.PushContext('plugins.' + PLUGIN.ID.toLowerCase());

        this._info.SetName(self.lang('.name'));
        this._info.SetDescription(self.lang('.description'));
        this._info.SetVersion(PLUGIN.VERSION);
        this._info.SetCategory(PLUGIN.CATEGORY);
        this._info.SetAuthor('LisGames');
        this._info.SetHelpUrl(self.lang('.help-url'));
        this._info.SetPluginType('world');
        this._info.SetIsResizable(true);
        this._info.SetIsRotatable(true);
        this._info.SetSupportsColor(true);
        this._info.SetSupportsZElevation(true);
        this._info.SetSupportsEffects(true);
        this._info.SetMustPreDraw(true);
        this._info.AddCommonPositionACEs();
        this._info.AddCommonSceneGraphACEs();
        this._info.AddCommonSizeACEs();
        this._info.AddCommonAngleACEs();
        this._info.AddCommonAppearanceACEs();
        this._info.AddCommonZOrderACEs();

        SDK.Lang.PushContext('.properties');

        this._info.SetProperties([
            new SDK.PluginProperty('longtext', 'text', 'Text'),
            new SDK.PluginProperty('font', 'font', 'Arial'),
            new SDK.PluginProperty('integer', 'baseFontSize', {
                initialValue: 12,
                minValue: 1,
                interpolatable: true,
            }),
            new SDK.PluginProperty('check', 'bold', false),
            new SDK.PluginProperty('check', 'italic', false),
            new SDK.PluginProperty('combo', 'horizontalAlign', {
                initialValue: 'center',
                items: ['left', 'center', 'right'],
            }),
            new SDK.PluginProperty('combo', 'verticalAlign', {
                initialValue: 'center',
                items: ['top', 'center', 'bottom'],
            }),
            new SDK.PluginProperty('check', 'forceAdapt', true),
            new SDK.PluginProperty('check', 'debugBorder', true),
        ]);

        SDK.Lang.PopContext(); // .properties

        SDK.Lang.PopContext();
    }
});

PLUGIN_CLASS.Register(PLUGIN.ID, PLUGIN_CLASS);
