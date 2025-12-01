const C3 = globalThis.C3;

const HorizontalAlignments = ['left', 'center', 'right'];
const VerticalAlignments = ['top', 'center', 'bottom'];

const DEFAULT_SIZE = 16;

C3.Plugins.yagames_adaptivetext.Instance = class AdaptiveTextInstance extends globalThis.ISDKWorldInstanceBase {
    constructor() {
        super();

        const properties = this._getInitProperties();

        this._text = '';
        this._font = 'Arial';
        this._baseFontSize = 12;
        this._bold = false;
        this._italic = false;
        this._horizontalAlign = 0;
        this._verticalAlign = 0;
        this._forceAdapt = false;
        this._debugBorder = true;

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

    _MaybeCreateRendererText(renderer) {
        if (this._rendererText) return;

        this._rendererText = renderer.createRendererText();
        this._dirtyText = true;
        this._rendererText.sizePt = this._calculatedFontSize || DEFAULT_SIZE;
    }

    _draw(renderer) {
        this._MaybeCreateRendererText(renderer);

        const layer = this.layer;
        const textZoom = layer.renderScale;
        this._rendererText.setSize(this.width, this.height, textZoom);

        this._rendererText.setColor(this.colorRgb);

        if (this._dirtyText) {
            this._dirtyText = false;

            if (this._text.length <= 0) return;

            this._rendererText.fontFace = this._font;
            this._rendererText.text = this._text;
            this._rendererText.horizontalAlign = this._horizontalAlign;
            this._rendererText.verticalAlign = this._verticalAlign;
            this._rendererText.sizePt = this._baseFontSize;
            this._rendererText.isBold = this._bold;
            this._rendererText.isItalic = this._italic;

            const width = this.width;
            const height = this.height;
            const wrapWidth = this._rendererText.textWidth;
            const wrapHeight = this._rendererText.textHeight;

            if (this._forceAdapt || width < wrapWidth || height < wrapHeight) {
                if (width / height < wrapWidth / wrapHeight) {
                    this._calculatedFontSize = Math.floor(this._baseFontSize * (width / wrapWidth));
                } else {
                    this._calculatedFontSize = Math.floor(this._baseFontSize * (height / wrapHeight));
                }
                this._rendererText.sizePt = this._calculatedFontSize;
            }
        }

        const texture = this._rendererText.getTexture();
        if (!texture) return;

        renderer.setTexture(texture);

        let quad = this.getBoundingQuad();

        if (this.runtime.isPixelRoundingEnabled) {
            const x = this.x;
            const y = this.y;
            const offsetX = Math.round(x) - x;
            const offsetY = Math.round(y) - y;

            if (offsetX !== 0 || offsetY !== 0) {
                quad = new DOMQuad(
                    new DOMPoint(quad.p1.x + offsetX, quad.p1.y + offsetY),
                    new DOMPoint(quad.p2.x + offsetX, quad.p2.y + offsetY),
                    new DOMPoint(quad.p3.x + offsetX, quad.p3.y + offsetY),
                    new DOMPoint(quad.p4.x + offsetX, quad.p4.y + offsetY)
                );
            }
        }

        renderer.quad3(quad, this._rendererText.getTexRect());
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
        this.runtime.sdk.updateRender();
    }

    GetText() {
        return this._rendererText?.text || '';
    }

    _SetFont(value) {
        this._font = value;
        this._dirtyText = true;
        this.runtime.sdk.updateRender();
    }

    GetFont() {
        return this._rendererText?.fontFace || '';
    }

    _SetBaseFontSize(value) {
        this._baseFontSize = value;
        this._dirtyText = true;
        this.runtime.sdk.updateRender();
    }

    GetBaseFontSize() {
        return this._rendererText?.sizePt || 0;
    }

    _SetBold(value) {
        this._bold = value;
        this._dirtyText = true;
        this.runtime.sdk.updateRender();
    }

    GetBold() {
        return this._rendererText?.isBold || false;
    }

    _SetItalic(value) {
        this._italic = value;
        this._dirtyText = true;
        this.runtime.sdk.updateRender();
    }

    GetItalic() {
        return this._rendererText?.isItalic || false;
    }

    _SetHorizontalAlign(value) {
        this._horizontalAlign = HorizontalAlignments[value];
        this._dirtyText = true;
        this.runtime.sdk.updateRender();
    }

    GetHorizontalAlign() {
        return this._rendererText?.horizontalAlign;
    }

    _SetVerticalAlign(value) {
        this._verticalAlign = VerticalAlignments[value];
        this._dirtyText = true;
        this.runtime.sdk.updateRender();
    }

    GetVerticalAlign() {
        return this._rendererText?.verticalAlign;
    }
};
