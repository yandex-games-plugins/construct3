/* eslint-disable no-case-declarations */
const C3 = globalThis.C3;

const TRANSLATE_COMMAND = 'TRANSLATE_COMMAND';

//#region Localization

class Localization {
    /** @param {YandexGamesSDKInstance} instance */
    constructor(instance) {
        this.pluginInstance = instance;
        this.runtime = instance.runtime;
        this.assetManager = this.runtime.assets;
        this.translationsMap = new Map();
        this.translationDirectory;
        this.decoratedObjects = new Set();
        this.decoratedPlugins = new Set();

        /** @typedef {{[key: string]: string | StringKeysObject | undefined}} StringKeysObject */

        /**
         * Storage for current game translation map.
         * @type {StringKeysObject | undefined}
         */
        this.valueMap = undefined;

        /** @type {string} */
        this.defaultLanguage = 'en';

        /** @type {string | undefined} */
        this.currentLanguage = undefined;

        /** @type {Set<any>} */
        this.decoratedSDKInstances = new Set();

        /** @type {Set<any>} */
        this.decoratedObjects = new Set();

        // prettier-ignore
        this.validLanguageCodes = new Set(['af', 'am', 'ar', 'az', 'be', 'bg', 'bn', 'ca', 'cs', 'da', 'de', 'el', 'en', 'es', 'et', 'eu', 'fa', 'fi', 'fr', 'gl', 'he', 'hi', 'hr', 'hu', 'hy', 'id', 'is', 'it', 'ja', 'ka', 'kk', 'km', 'kn', 'ko', 'ky', 'lo', 'lt', 'lv', 'mk', 'ml', 'mn', 'mr', 'ms', 'my', 'ne', 'nl', 'no', 'pl', 'pt', 'ro', 'ru', 'si', 'sk', 'sl', 'sr', 'sv', 'sw', 'ta', 'te', 'tg', 'th', 'tk', 'tl', 'tr', 'uk', 'ur', 'uz', 'vi', 'zh', 'zu']);
    }

    /**
     * @param {string} languageCode
     * @returns {boolean}
     */
    IsValidLanguageCode(languageCode) {
        return this.validLanguageCodes.has(languageCode);
    }

    /**
     * Finds property descriptor by finding in object's prototypes
     * Mainly used to redefine class methods or properties getters/setters
     *
     * @template O
     * @param {O} obj
     * @param {keyof O} key
     * @returns {PropertyDescriptor | undefined}
     */
    DeepFindPropertyDescriptor(obj, key) {
        let desc;
        do {
            desc = Object.getOwnPropertyDescriptor(obj, key);
        } while (!desc && (obj = Object.getPrototypeOf(obj)));
        return desc;
    }

    /** @type {(string:string) => string} */
    TranslateString(string) {
        let translatedString = string;

        const nonWrappedPaths = /\{[\w\d.]*\}/;

        let matches;
        while ((matches = translatedString.match(nonWrappedPaths) || matches?.lenght > 0)) {
            const match = matches[0];
            try {
                const path = match.slice(1, -1);
                const translation = this.GetValue(path);

                if (translation === undefined) {
                    throw new Error(`Translation for ${path} is undefined.`);
                }

                translatedString = translatedString.replace(match, translation);
            } catch (e) {
                console.error(e);
                this.pluginInstance.DeveloperAlert(
                    `Can't apply translation for ${match} in ${this.currentLanguage}. More info in console.`
                );
                break;
            }
        }

        return translatedString;
    }

    /**
     * @param {string} path
     * @returns {string}
     */
    GetValue(path) {
        return this.valueMap ? this.valueMap[path] : '';
    }

    DecoratePlugins() {
        const objects = this.runtime.objects;

        const translateSprite = instance => {
            if (instance.getAnimation(this.currentLanguage)) {
                instance.setAnimation(this.currentLanguage, 'current-frame');
            } else if (instance.getAnimation(this.defaultLanguage)) {
                instance.setAnimation(this.defaultLanguage, 'current-frame');
            }
        };

        const translateText = instance => {
            instance.text = TRANSLATE_COMMAND;
        };

        for (let plugin of Object.values(globalThis.C3.Plugins)) {
            if (!this.decoratedPlugins.has(plugin)) {
                const self = this;
                const prototype = plugin.Instance.prototype;
                const originalSetText = prototype?._SetText;

                if (originalSetText) {
                    prototype._SetText = function (value) {
                        if (this._originalText === undefined) {
                            this._originalText = this._text;
                        }
                        if (value !== TRANSLATE_COMMAND) {
                            this._originalText = value;
                        }
                        originalSetText.call(this, self.TranslateString.call(self, this._originalText));
                    };
                }

                this.decoratedPlugins.add(plugin);
            }
        }

        for (const obj of Object.values(objects)) {
            let isSprite = false;

            if (globalThis.ISpriteObjectType) {
                isSprite = obj instanceof globalThis.ISpriteObjectType;
            }

            obj.getAllInstances().forEach(instance => {
                if (isSprite) {
                    translateSprite(instance);
                } else {
                    translateText(instance);
                }
            });

            if (!this.decoratedObjects.has(obj)) {
                obj.addEventListener('instancecreate', event => {
                    if (isSprite) {
                        translateSprite(event.instance);
                    } else if (event.instance.text) {
                        translateText(event.instance);
                    }
                });

                this.decoratedObjects.add(obj);
            }
        }
    }

    FlattenTranslations(object) {
        const parsedTranslations = {};

        for (const key in object) {
            const value = object[key];

            switch (typeof value) {
                case 'object': {
                    const nestedTranslations = this.FlattenTranslations(value);

                    for (const nestedKey in nestedTranslations) {
                        parsedTranslations[`${key}.${nestedKey}`] = nestedTranslations[nestedKey];
                    }
                    break;
                }

                case 'string':
                    parsedTranslations[key] = value;
                    break;

                default:
                    parsedTranslations[key] = value.toString();
                    break;
            }
        }

        return parsedTranslations;
    }

    FetchLanguageWithPath(dir, lang) {
        const path = [dir, lang].filter(Boolean).join('/') + '.json';

        return this.assetManager.fetchJson(path).then(json => {
            this.translationDirectory = dir;

            const flattenTranslation = this.FlattenTranslations(json);
            this.translationsMap.set(lang, flattenTranslation);

            return flattenTranslation;
        });
    }

    /** @type {(lang: string) => Promise<string | undefined>} */
    FetchLanguage(lang) {
        if (this.translationsMap.has(lang)) {
            return Promise.resolve(this.translationsMap.get(lang));
        }

        if (this.translationDirectory === undefined) {
            return Promise.any([this.FetchLanguageWithPath('i18n', lang), this.FetchLanguageWithPath('', lang)]).catch(
                () => undefined
            );
        }

        return this.FetchLanguageWithPath(this.translationDirectory, lang);
    }

    async SwitchLanguage(languageCode) {
        this.pluginInstance.Info(`Switching localization language (${languageCode})`);

        this.valueMap = await this.FetchLanguage(languageCode);

        if (this.valueMap !== undefined) {
            this.currentLanguage = languageCode;
            this.DecoratePlugins();

            return;
        }

        this.pluginInstance.Warn(
            `Can't find translation map for ${languageCode}. Switching to default language "${this.defaultLanguage}".`
        );

        this.valueMap = await this.FetchLanguage(this.defaultLanguage);

        if (this.valueMap !== undefined) {
            this.currentLanguage = languageCode;
            this.DecoratePlugins();

            return;
        }

        this.currentLanguage = undefined;
        this.valueMap = undefined;
        this.pluginInstance.Warn(
            `Can't find translation map for default language "${this.defaultLanguage}", make sure that you have translation map in "i18n" folder.`
        );
    }
}

//#endregion

//#region Instance

const DOM_COMPONENT_ID = 'yagames_sdk';

/** @class */
class YandexGamesSDKInstance extends globalThis.ISDKInstanceBase {
    constructor() {
        super({ domComponentId: DOM_COMPONENT_ID });

        const properties = this._getInitProperties();

        const defaultLanguage = properties[0];
        const autoInitialization = properties[1];
        const metrikaCounterId = properties[2];

        /** @type {types.YSDK["environment"]} */
        this.environment = {
            app: { id: '0' },
            browser: { lang: defaultLanguage },
            i18n: { lang: defaultLanguage, tld: '.com' },
            payload: '',
        };

        /** @type {"desktop" | "mobile" | "tablet" | "tv"} */
        this.deviceType = 'desktop';

        /** @type {Conditions} */
        this.conditions = C3.Plugins.yagames_sdk.Cnds;

        /** @type {Actions} */
        this.actions = C3.Plugins.yagames_sdk.Acts;

        /** @type {Expressions} */
        this.expressions = C3.Plugins.yagames_sdk.Exps;

        this.localization = new Localization(this);
        this.localization.defaultLanguage = defaultLanguage;

        //#region Fullscreen AD

        /** @type {boolean} */
        this.fullscreenADWasShown = false;

        /** @type {string | undefined} */
        this.fullscreenADError = undefined;

        this.metrikaCounterId = metrikaCounterId;

        this._addDOMMessageHandler(
            'ysdk-fullscreen-ad-callback',
            /** @param {{type: "onClose" | "onOpen" | "onError" | "onOffline", wasShown?: boolean, error?: string}} data  */
            data => {
                switch (data.type) {
                    case 'onOpen':
                        this._trigger(this.conditions.OnFullscreenADOpen);
                        break;
                    case 'onClose':
                        this.fullscreenADWasShown = data.wasShown;
                        this._trigger(this.conditions.OnFullscreenADClose);
                        break;
                    case 'onError':
                        this.fullscreenADError = data.error;
                        this._trigger(this.conditions.OnFullscreenADError);
                        break;
                    case 'onOffline':
                        this._trigger(this.conditions.OnFullscreenADOffline);
                        break;
                }
            }
        );

        //#endregion

        //#region Rewarded AD

        /** @type {string | undefined} */
        this.currentRewardedID = undefined;

        /** @type {string | undefined} */
        this.currentRewardedError = undefined;

        this._addDOMMessageHandler(
            'ysdk-rewarded-ad-callback',
            /** @param {{type: "onOpen" | "onRewarded" | "onClose" | "onError", id: string, error?: string}} data  */
            async data => {
                this.currentRewardedID = data.id;
                switch (data.type) {
                    case 'onOpen':
                        await this._triggerAsync(this.conditions.OnRewardedADOpen);
                        await this._triggerAsync(this.conditions.OnAnyRewardedADOpen);
                        break;
                    case 'onRewarded':
                        await this._triggerAsync(this.conditions.OnRewardedADRewarded);
                        break;
                    case 'onClose':
                        await this._triggerAsync(this.conditions.OnRewardedADClose);
                        await this._triggerAsync(this.conditions.OnAnyRewardedADClose);
                        break;
                    case 'onError':
                        this.currentRewardedError = data.error;
                        await this._triggerAsync(this.conditions.OnRewardedADError);
                        await this._triggerAsync(this.conditions.OnAnyRewardedADError);
                        this.currentRewardedError = undefined;
                        break;
                }
                this.currentRewardedID = undefined;
            }
        );

        //#endregion

        //#region Leaderboards

        /**
         * @typedef {{
         *   leaderboard: types.LeaderboardDescription;
         *   ranges: { start: number; size: number }[];
         *   entries: {
         *    score: number;
         *    extraData: string | undefined;
         *    rank: number;
         *    player: {
         *      avatarSrc: {
         *        small: string;
         *        medium: string;
         *        large: string;
         *      };
         *      avatarSrcSet: {
         *        small: string;
         *        medium: string;
         *        large: string;
         *      };
         *      lang: string;
         *      publicName: string;
         *      scopePermissions: {
         *        avatar: string;
         *        public_name: string;
         *      };
         *      uniqueID: string;
         *    };
         *    formattedScore: string;
         *   }[];
         * }} RuntimeEntries
         */

        /** @type {{entriesData: RuntimeEntries;["currentIndex"]: number} | undefined} */
        this.forEachLeaderboardEntryLoopData = undefined;

        //#endregion

        //#region Payments
        /**
         * @typedef {Object} PurchaseTriggerData
         * @property {string} productID
         * @property {string} purchaseToken
         * @property {string|undefined} developerPayload
         * @property {string|undefined} signature
         * @property {string|undefined} error
         */

        /** @type {PurchaseTriggerData | undefined} */
        this.currentPurchaseData = undefined;

        /** @type {{purchases: types.Signed<types.Purchase[]>,["currentIndex"]: number} | undefined} */
        this.currentPurchasesLoopData = undefined;

        /**
         * @typedef {Object} RuntimeProduct
         * @property {string} id
         * @property {string} title
         * @property {string} description
         * @property {string} imageURI
         * @property {string} price
         * @property {string} priceValue
         * @property {string} priceCurrencyCode
         * @property {{small: string; medium: string; svg: string;}} priceCurrencyImage
         */

        /** @type {{catalog: RuntimeProduct[],["currentIndex"]: number} | undefined} */
        this.currentCatalogLoopData = undefined;

        this._addDOMMessageHandler(
            'ysdk-purchase-callback',
            /** @param {{error?: string, productID: string, purchaseToken: string, developerPayload?: string, signature?: string}} data  */
            async data => {
                this.currentPurchaseData = {
                    productID: data.productID,
                    purchaseToken: data.purchaseToken,
                    developerPayload: data.developerPayload,
                    signature: data.signature,
                    error: data.error,
                };

                if (data.error) {
                    await this._triggerAsync(this.conditions.OnSpecificPurchaseError);
                    await this._triggerAsync(this.conditions.OnPurchaseError);
                    console.error('Purchase error', data);
                    this.currentPurchaseData = undefined;
                    return;
                }

                await this._triggerAsync(this.conditions.OnSpecificPurchaseSuccess);
                await this._triggerAsync(this.conditions.OnPurchaseSuccess);
                console.log('Purchase success', data);
                this.currentPurchaseData = undefined;
            }
        );

        //#endregion

        //#region Player

        /**
         * @typedef {Object} PlayerAvatars
         * @property {string} small
         * @property {string} medium
         * @property {string} large
         */

        /**
         * @typedef {Object} PlayerInfo
         * @property {boolean} isAuthorized
         * @property {boolean} isAccessGranted
         * @property {string} uniqueID
         * @property {string} publicName
         * @property {PlayerAvatars} avatars
         * @property {string} payingStatus
         * @property {string | undefined} signature
         */

        /** @type {PlayerInfo | undefined} */
        this.playerInfo = undefined;

        //#endregion

        //#region Events

        this._addDOMMessageHandler('ysdk-handle-event', e => {
            switch (e.type) {
                case 'HISTORY_BACK':
                    this._trigger(this.conditions.OnHistoryBackEvent);
                    break;
                case 'game_api_pause':
                    this._trigger(this.conditions.OnGameAPIPause);
                    break;
                case 'game_api_resume':
                    this._trigger(this.conditions.OnGameAPIResume);
                    break;
            }
        });

        //#endregion

        //#region Shortcut

        /** @type {boolean} */
        this.canShowShortcutPrompt = false;

        this._addDOMMessageHandler('ysdk-update-can-show-shortcut-prompt', data => {
            this.canShowShortcutPrompt = data.canShow;
            return true;
        });

        this._addDOMMessageHandler('ysdk-shortcut-show-prompt-result', data => {
            if (data.accepted) {
                this._trigger(this.conditions.OnShortcutAdded);
            }
        });

        //#endregion

        //#region Review

        /** @type {boolean} */
        this.canReview = false;

        this._addDOMMessageHandler('ysdk-update-can-review', data => {
            this.canReview = data.value;
            return true;
        });

        //#endregion

        //#region Misc

        /** @type {Map<any, number>} */
        this.throttleTimers = new Map();

        /** @type {Map<any, number>} */
        this.debounceTimers = new Map();

        /** @type {number} */
        this.serverTime = 0;

        this._addDOMMessageHandler('ysdk-server-time-update', value => {
            this.serverTime = value;
        });

        //#endregion

        //#region Remote Config

        /** @type {Record<string, string>} */
        this.flags = {};

        /** @type {Record<string, string>} */
        this.defaultFlags = {};

        /** @type {{name: string, value: string}[]} */
        this.clientFeatures = [];

        //#endregion

        //#region Game Linking

        /** @type {string} */
        this.developerURL = '';

        /** @type {{game: {appID: string, title: string, url: string, coverURL: string, iconURL: string}, isAvaliable: boolean} | undefined} */
        this.currentGamesLoopData = undefined;

        //#endregion

        //#region TV

        const TV_BUTTON = {
            UP: 0,
            DOWN: 1,
            LEFT: 2,
            RIGHT: 3,
            OK: 4,
        };

        //                 up,    down,  left,  right, ok
        this._tvButtons = [false, false, false, false, false];

        this._triggerButton = undefined;

        this._addDOMMessageHandler('gamepads-update', data => {
            if (this._tvButtons[TV_BUTTON.UP] !== data.upPressed) {
                this._triggerButton = TV_BUTTON.UP;

                if (data.upPressed) {
                    this._trigger(this.conditions.OnTVRemoteButtonPress);
                } else {
                    this._trigger(this.conditions.OnTVRemoteButtonRelease);
                }

                this._tvButtons[TV_BUTTON.UP] = data.upPressed;
            }

            if (this._tvButtons[TV_BUTTON.DOWN] !== data.downPressed) {
                this._triggerButton = TV_BUTTON.DOWN;

                if (data.downPressed) {
                    this._trigger(this.conditions.OnTVRemoteButtonPress);
                } else {
                    this._trigger(this.conditions.OnTVRemoteButtonRelease);
                }

                this._tvButtons[TV_BUTTON.DOWN] = data.downPressed;
            }

            if (this._tvButtons[TV_BUTTON.LEFT] !== data.leftPressed) {
                this._triggerButton = TV_BUTTON.LEFT;

                if (data.leftPressed) {
                    this._trigger(this.conditions.OnTVRemoteButtonPress);
                } else {
                    this._trigger(this.conditions.OnTVRemoteButtonRelease);
                }

                this._tvButtons[TV_BUTTON.LEFT] = data.leftPressed;
            }

            if (this._tvButtons[TV_BUTTON.RIGHT] !== data.rightPressed) {
                this._triggerButton = TV_BUTTON.RIGHT;

                if (data.rightPressed) {
                    this._trigger(this.conditions.OnTVRemoteButtonPress);
                } else {
                    this._trigger(this.conditions.OnTVRemoteButtonRelease);
                }

                this._tvButtons[TV_BUTTON.RIGHT] = data.rightPressed;
            }
        });

        this._addDOMMessageHandler('tv-remote-ok-click', pressed => {
            if (this._tvButtons[TV_BUTTON.OK] !== pressed) {
                this._triggerButton = TV_BUTTON.OK;

                if (pressed) {
                    this._trigger(this.conditions.OnTVRemoteButtonPress);
                } else {
                    this._trigger(this.conditions.OnTVRemoteButtonRelease);
                }

                this._tvButtons[TV_BUTTON.OK] = pressed;
            }
        });

        //#endregion

        if (this.runtime.platformInfo.exportType === 'preview') {
            this._postToDOM('start-tv-remote-emulator');
            this._postToDOM('start-tv-remote-tracking');
            this.localization.SwitchLanguage(this.localization.defaultLanguage);
        } else if (autoInitialization) {
            this.runtime.sdk.addLoadPromise(this.InitializeYSDK());
        }
    }

    InitializeYSDK() {
        return this._postToDOMAsync('ysdk-initialize').then(this.InitCallback.bind(this));
    }

    /**
     * Callback for sdk initialization.
     * @param {{environment?: types.YSDK["environment"], deviceType?: types.YSDK["deviceInfo"]["type"], developerURL?: string}} data
     */
    async InitCallback(data) {
        if (!data) {
            await this.localization.SwitchLanguage(this.localization.defaultLanguage);
            return;
        }

        this.environment = data.environment;
        this.deviceType = data.deviceType;
        this.developerURL = data.developerURL ?? '';

        const yandexLanguage = this.environment.i18n.lang;

        await this.localization.SwitchLanguage(yandexLanguage);

        this._postToDOM('ysdk-init-finish');

        if (this.conditions.IsTV.call(this)) {
            this._postToDOM('start-tv-remote-tracking');
        }
    }

    /**
     * Debug method for displaying errors in preview mode and console.error in runtime mode.
     * Ment to notify developers about their wrong plugin usage.
     */
    DeveloperAlert(message) {
        if (this.runtime.platformInfo.exportType === 'preview') {
            alert('[YandexGamesSDK] ' + message);
        }

        console.warn('[YandexGamesSDK] ' + message);
    }

    Info(message) {
        console.log('[YandexGamesSDK] ' + message);
    }

    Warn(message) {
        console.warn('[YandexGamesSDK] ' + message);
    }

    /**
     * Function to informate about developer mistakes
     * @param {string} message
     */
    logDeveloperMistake(message) {
        let lines = message.split('\n');
        const maxLength = lines.reduce((p, c) => (p < c.length ? c.length : p), 0);
        const whitespaces = ''.padEnd(maxLength + 2, ' ');
        const formattedMessage = lines.map(line => line.padEnd(maxLength + 1, ' ')).join('\n');
        console.log(
            `${whitespaces}\n%cWarning\n%c${formattedMessage}\n\nPlease, check your events!\n${whitespaces}`,
            'color:#fb3c3c;font-size:2rem;font-weight:bold',
            'color:#fb3c3c'
        );
    }
}

C3.Plugins.yagames_sdk.Instance = YandexGamesSDKInstance;

//#endregion
