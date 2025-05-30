const C3 = self.C3;

const HorizontalAlignments = ['left', 'center', 'right'];
const VerticalAlignments = ['top', 'center', 'bottom'];

C3.Plugins.yagames_adaptivetext.Instance = class AdaptiveTextInstance extends C3.SDKWorldInstanceBase {
    constructor(inst, properties) {
        super(inst);

        this._text = '';
        this._font = 'Arial';
        this._baseFontSize = 12;
        this._bold = false;
        this._italic = false;
        this._horizontalAlign = 0;
        this._verticalAlign = 0;
        this._forceAdapt = true;
        this._debugBorder = true;

        // Lazy-created renderer text object
        this._rendererText = null;

        if (properties) {
            this._text = properties[0];
            this._font = properties[1];
            this._baseFontSize = properties[2];
            this._bold = properties[3];
            this._italic = properties[4];
            this._horizontalAlign = HorizontalAlignments[properties[5]];
            this._verticalAlign = VerticalAlignments[properties[6]];
            this._forceAdapt = properties[7];
            this._debugBorder = properties[8];
        }
    }

    Release() {
        super.Release();
    }

    _MaybeCreateRendererText(renderer) {
        if (this._rendererText) return;

        this._rendererText = renderer.CreateRendererText();
        this._dirtyText = true;
        this._rendererText.SetFontSize(this._calculatedFontSize);

        this._rendererText.SetIsAsync?.(false);
    }

    Draw(renderer) {
        this._MaybeCreateRendererText(renderer);

        const worldInfo = this.GetWorldInfo();
        const layer = worldInfo.GetLayer();
        const textZoom = layer.GetRenderScale();
        this._rendererText.SetSize(worldInfo.GetWidth(), worldInfo.GetHeight(), textZoom);

        const color = worldInfo.GetPremultipliedColor();
        this._rendererText.SetColorRgb(color.getR(), color.getG(), color.getB());

        if (this._dirtyText) {
            if (this._text.length <= 0) return;

            this._rendererText.SetFontName(this._font);
            this._rendererText.SetText(this._text);
            this._rendererText.SetHorizontalAlignment(this._horizontalAlign);
            this._rendererText.SetVerticalAlignment(this._verticalAlign);
            this._rendererText.SetFontSize(this._baseFontSize);

            if (!this._rendererText.GetTexture()) return;

            const width = worldInfo.GetWidth();
            const height = worldInfo.GetHeight();
            const wrapWidth = this._rendererText.GetTextWidth();
            const wrapHeight = this._rendererText.GetTextHeight();

            if (this._forceAdapt || width < wrapWidth || height < wrapHeight) {
                if (width / height < wrapWidth / wrapHeight) {
                    this._calculatedFontSize = Math.floor(this._baseFontSize * (width / wrapWidth));
                } else {
                    this._calculatedFontSize = Math.floor(this._baseFontSize * (height / wrapHeight));
                }
                this._rendererText.SetFontSize(this._calculatedFontSize);
            }

            this._dirtyText = false;
        }

        const texture = this._rendererText.GetTexture();
        if (!texture) return;

        renderer.SetTexture(texture);

        let quad = worldInfo.GetBoundingQuad();
        if (this._runtime.IsPixelRoundingEnabled()) {
            quad = worldInfo.PixelRoundQuad(quad);
        }
        renderer.Quad3(quad, this._rendererText.GetTexRect());
    }

    SaveToJson() {
        return {
            font: this._font,
            text: this._text,
            baseFontSize: this._baseFontSize,
            bold: this._bold,
            italic: this._italic,
            horizontalAlign: this._horizontalAlign,
            verticalAlign: this._verticalAlign,
            forceAdapt: this._forceAdapt,
            debugBorder: this._debugBorder,
        };
    }

    LoadFromJson(o) {
        this._font = o.font;
        this._text = o.text;
        this._baseFontSize = o.baseFontSize;
        this._bold = o.bold;
        this._italic = o.italic;
        this._horizontalAlign = o.horizontalAlign;
        this._verticalAlign = o.verticalAlign;
        this._forceAdapt = o.forceAdapt;
        this._debugBorder = o.debugBorder;

        this._dirtyText = true;
    }

    _SetText(value) {
        this._text = value;
        this._dirtyText = true;
        this._runtime.UpdateRender();
    }

    GetText() {
        return this._text;
    }

    _SetFont(value) {
        this._font = value;
        this._dirtyText = true;
        this._runtime.UpdateRender();
    }

    GetFont() {
        return this._font;
    }

    _SetBaseFontSize(value) {
        this._baseFontSize = value;
        this._dirtyText = true;
        this._runtime.UpdateRender();
    }

    GetBaseFontSize() {
        return this._baseFontSize;
    }

    _SetBold(value) {
        this._bold = value;
        this._dirtyText = true;
        this._runtime.UpdateRender();
    }

    GetBold() {
        return this._bold;
    }

    _SetItalic(value) {
        this._italic = value;
        this._dirtyText = true;
        this._runtime.UpdateRender();
    }

    GetItalic() {
        return this._italic;
    }

    _SetHorizontalAlign(value) {
        this._horizontalAlign = HorizontalAlignments[value];
        this._dirtyText = true;
        this._runtime.UpdateRender();
    }

    GetHorizontalAlign() {
        return this._horizontalAlign;
    }

    _SetVerticalAlign(value) {
        this._verticalAlign = VerticalAlignments[value];
        this._dirtyText = true;
        this._runtime.UpdateRender();
    }

    GetVerticalAlign() {
        return this._verticalAlign;
    }

    GetScriptInterfaceClass() {
        return self.IAdaptiveTextInstance;
    }
};

const map = new WeakMap();

self.IAdaptiveTextInstance = class IAdaptiveTextInstance extends self.IWorldInstance {
    constructor() {
        super();

        map.set(this, self.IInstance._GetInitInst().GetSdkInstance());
    }

    set text(t) {
        map.get(this)._SetText(t);
    }

    get text() {
        return map.get(this).GetText();
    }
};
