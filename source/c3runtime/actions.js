const C3 = self.C3;

/**
 * Finds property descriptor by finding in object's prototypes
 * Mainly used to redefine class methods or properties getters/setters
 *
 * @template O
 * @param {O} obj
 * @param {keyof O} key
 * @returns {PropertyDescriptor | undefined}
 */
function deepFindPropertyDescriptor(obj, key) {
  let desc;
  do {
    desc = Object.getOwnPropertyDescriptor(obj, key);
  } while (!desc && (obj = Object.getPrototypeOf(obj)));
  return desc;
}

/**
 * Debug method for displaying errors in preview mode and console.error in runtime mode.
 * Ment to notify developers about their wrong plugin usage.
 */
function developerAlert(runtime, message) {
  if (runtime._exportType === "preview") {
    alert("[YandexGamesSDK] " + message);
  }

  console.warn("[YandexGamesSDK] " + message);
}

/** @class */
const Actions = {
  //#region Localization

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} lang
   */
  SetDefaultLanguage(lang) {
    this.defaultLanguage = lang;
  },

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} lang
   */
  async SwitchLanguage(lang) {
    console.debug("Switch Language", lang);

    const runtime = this.GetRuntime();
    const assetManager = runtime.GetAssetManager();

    /** @type {(lang:string) => Promise<string | undefined>} */
    const findLocalizations = async (lang) => {
      let url;
      try {
        if (runtime._exportType === "preview") {
          const blobs = assetManager._localUrlBlobs;
          blobs.forEach((_, k) => {
            if (k.includes(`${lang}.json`)) {
              url = k;
            }
          });
          return await blobs.get(url).text();
        } else {
          url =
            runtime._runtimeBaseUrl +
            (assetManager._fileStructure == "flat" ? "" : "i18n/") +
            `${lang}.json`;
          return await (await fetch(url)).text();
        }
      } catch (e) {
        console.error(e);
        console.debug(url);
        return undefined;
      }
    };

    let checkLang = lang;
    let rawLocalizations = await findLocalizations(lang);
    if (rawLocalizations === undefined && this.defaultLanguage != null) {
      console.debug(
        `Can't find localizations for ${lang}. Switching to default ${this.defaultLanguage}.`
      );

      checkLang = this.defaultLanguage;
      this.currentLanguage = this.defaultLanguage;
      rawLocalizations = await findLocalizations(this.defaultLanguage);
      if (rawLocalizations === "") {
        checkLang = "";
        rawLocalizations = "{}";
      }
    }

    this.currentLanguage = checkLang;

    try {
      this.localizations = JSON.parse(rawLocalizations);
    } catch (e) {
      developerAlert(
        runtime,
        "Error while parsing localizations. Make sure that localizations exist and are valid JSON."
      );

      console.debug(
        "rawLocalizations:",
        rawLocalizations,
        "lang:",
        this.currentLanguage
      );
      console.error(e);
      this.localizations = {};
      return;
    }

    /** @type {(text:string) => string} */
    const trasnlate = (text) => {
      try {
        // Remove previous localizations
        let _text = text.replace(/\[(\{[\w\d.]*\})\].*\[\1\]/g, "$1");

        // Translate
        _text.match(/\{[\w\d.]*\}/g)?.forEach((match) => {
          const path = match.slice(1, -1);
          const translated = path
            .split(".")
            .reduce(
              (acc, key) => (acc[key] ? acc[key] : undefined),
              this.localizations ?? {}
            );
          const wrapper = `[{${path}}]`;
          _text = _text.replace(match, wrapper + translated + wrapper);
        });

        // Return translated text
        return _text;
      } catch (e) {
        developerAlert(
          runtime,
          `Wasn't able to translate text: ${text}. Make sure that localizations exists.`
        );

        console.error(e);
        return text;
      }
    };

    runtime
      .GetAllObjectClasses()
      .filter((objectClass) => {
        const pluginName = objectClass.GetPlugin().constructor.name;
        return pluginName === "TextPlugin" || pluginName === "SpriteFontPlugin";
      })
      .forEach((objectClass) => {
        const translateInstance = (instance) => {
          const sdkInstance = instance.GetSdkInstance();

          // Translate current content of a text
          sdkInstance._SetText(trasnlate(sdkInstance.GetText()));

          const setTextMethodName = "_SetText";

          // Decorate _SetText method of sdkInstance for auto-localization feature
          if (!this.decoratedInstances.has(sdkInstance)) {
            const setTextDescriptor = deepFindPropertyDescriptor(
              sdkInstance,
              setTextMethodName
            );

            if (setTextDescriptor) {
              const originalSetText = setTextDescriptor.value;
              Object.defineProperty(sdkInstance, setTextMethodName, {
                configurable: setTextDescriptor.configurable,
                enumerable: setTextDescriptor.enumerable,
                value: (text) => {
                  originalSetText.apply(sdkInstance, [trasnlate(text)]);
                },
              });
            } else {
              console.error(
                `Can't find property descriptor ${setTextMethodName} of`,
                sdkInstance
              );
            }

            this.decoratedInstances.add(sdkInstance);
          }
        };

        objectClass.GetInstances().forEach((instance) => {
          translateInstance(instance);
        });

        /**
         * Decorate _AddInstance method of objectClass to auto-translate new instances
         */
        if (!this.decoratedObjects.has(objectClass)) {
          const addInstanceMethodName = "_AddInstance";

          const addInstanceDescriptior = deepFindPropertyDescriptor(
            objectClass,
            addInstanceMethodName
          );

          if (addInstanceDescriptior) {
            const originalAddInstance = addInstanceDescriptior.value;

            Object.defineProperty(objectClass, addInstanceMethodName, {
              configurable: addInstanceDescriptior.configurable,
              enumerable: addInstanceDescriptior.enumerable,
              value: (instance) => {
                originalAddInstance.apply(objectClass, [instance]);
                translateInstance(instance);
              },
            });

            this.decoratedObjects.add(objectClass);
          } else {
            console.error(
              `Can't find property descriptor ${addInstanceMethodName} of`,
              objectClass
            );
          }
        }
      });

    runtime
      .GetAllObjectClasses()
      .filter((objectClass) => {
        const pluginName = objectClass.GetPlugin().constructor.name;
        return (
          pluginName === "SpritePlugin" &&
          // Check that all animations names are valid language codes
          objectClass._animations &&
          objectClass._animations.every((animationInfo) =>
            this.isValidLanguageCode(animationInfo._name)
          )
        );
      })
      .forEach((objectClass) => {
        const translateInstance = (instance) => {
          const sdkInstance = instance.GetSdkInstance();

          // Get animations map
          const animationsByName = sdkInstance._objectClass?._animationsByName;
          if (!animationsByName) return;

          // Apply current language animation if exists, otherwise apply default language animation if exists.
          // Make sure that we preserve current frame index.
          if (animationsByName.has(this.currentLanguage)) {
            sdkInstance._SetAnim(
              this.currentLanguage,
              sdkInstance._currentFrameIndex
            );
          } else if (animationsByName.has(this.defaultLanguage)) {
            console.debug(
              "Animation for current language not found",
              sdkInstance
            );

            sdkInstance._SetAnim(
              this.defaultLanguage,
              sdkInstance._currentFrameIndex
            );
          }
        };

        // Set animation of all instances to current language
        objectClass.GetInstances().forEach((instance) => {
          translateInstance(instance);
        });

        /**
         * Decorate _AddInstance method of objectClass to auto-translate new instances
         */
        if (!this.decoratedObjects.has(objectClass)) {
          const addInstanceMethodName = "_AddInstance";

          const addInstanceDescriptior = deepFindPropertyDescriptor(
            objectClass,
            addInstanceMethodName
          );

          if (addInstanceDescriptior) {
            const originalAddInstance = addInstanceDescriptior.value;

            Object.defineProperty(objectClass, addInstanceMethodName, {
              configurable: addInstanceDescriptior.configurable,
              enumerable: addInstanceDescriptior.enumerable,
              value: (instance) => {
                originalAddInstance.apply(objectClass, [instance]);
                translateInstance(instance);
              },
            });

            this.decoratedObjects.add(objectClass);
          } else {
            console.error(
              `Can't find property descriptor ${addInstanceMethodName} of`,
              objectClass
            );
          }
        }
      });
  },

  //#endregion

  //#region Fullscreen AD

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  ShowFullscreenAD(id) {
    this.PostToDOM("ysdk-show-fullscreen-ad", { id });
  },

  //#endregion

  //#region Rewarded AD

  /**
   * @this {YandexGamesSDKInstance}
   * @param {string} id
   */
  ShowRewardedAD(id) {
    this.PostToDOM("ysdk-show-rewarded-ad", { id });
  },

  //#endregion

  //#region Sticky Banner

  ShowStickyBanner() {
    this.PostToDOM("ysdk-show-sticky-banner");
  },

  HideStickyBanner() {
    this.PostToDOM("ysdk-hide-sticky-banner");
  },

  //#endregion

  //#region DeviceInfo

  /** @this {YandexGamesSDKInstance} */
  EmulateMobile() {
    if (!this.deviceInfo) {
      this.emulatedDevice = "mobile";
      console.debug("Emulation mode: mobile");
    }
  },

  /** @this {YandexGamesSDKInstance} */
  EmulateTablet() {
    if (!this.deviceInfo) {
      this.emulatedDevice = "tablet";
      console.debug("Emulation mode: tablet");
    }
  },

  /** @this {YandexGamesSDKInstance} */
  EmulateDesktop() {
    if (!this.deviceInfo) {
      this.emulatedDevice = "desktop";
      console.debug("Emulation mode: desktop");
    }
  },

  /** @this {YandexGamesSDKInstance} */
  EmulateTV() {
    if (!this.deviceInfo) {
      this.emulatedDevice = "tv";
      console.debug("Emulation mode: tv");
    }
  },

  //#endregion

  //#region Misc

  LoadingAPIReady() {
    this.PostToDOM("ysdk-loading-api-ready");
  },

  //#endregion
};

C3.Plugins.yagames_sdk.Acts = Actions;
