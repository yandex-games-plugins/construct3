const SDK = self.SDK;

SDK.Plugins.yagames_adaptivetext.Instance = class AdaptiveTextInstance extends SDK.IWorldInstanceBase {
  constructor(sdkType, inst) {
    super(sdkType, inst);
    this._webglText = null;
  }

  Release() {
    if (this._webglText) {
      this._webglText.Release();
      this._webglText = null;
    }
  }

  OnCreate() {}

  OnPlacedInLayout() {
    this._inst.SetSize(72, 30);
  }

  Draw(iRenderer, iDrawParams) {
    const iLayoutView = iDrawParams.GetLayoutView();

    if (this.prevWidth !== this._inst.GetWidth() || this.prevHeight !== this._inst.GetHeight()) {
      this.prevWidth = this._inst.GetWidth();
      this.prevHeight = this._inst.GetHeight();
      this._dirtyText = true;
    }

    if (!this._webglText) {
      this._webglText = iRenderer.CreateWebGLText();
      this._dirtyText = true;
    }

    const textZoom = iLayoutView.GetZoomFactor();
    this._webglText.SetSize(this._inst.GetWidth(), this._inst.GetHeight(), textZoom);

    this._inst.ApplyBlendMode(iRenderer);
    iRenderer.SetColorFillMode();

    const quad = this._inst.GetQuad();

    iRenderer.SetColorRgba(0.1, 0.1, 0.1, 1);
    iRenderer.LineQuad(quad);

    const color = this._inst.GetColor();
    this._webglText.SetColorRgb(color.getR(), color.getG(), color.getB());

    if (this._dirtyText) {
      const text = this._inst.GetPropertyValue('text');
      if (text.length <= 0) return;

      this._webglText.SetText(text);

      this._webglText.SetFontName(this._inst.GetPropertyValue('font'));
      this._webglText.SetHorizontalAlignment(this._inst.GetPropertyValue('horizontalAlign'));
      this._webglText.SetVerticalAlignment(this._inst.GetPropertyValue('verticalAlign'));

      this._webglText.SetBold(this._inst.GetPropertyValue('bold'));
      this._webglText.SetItalic(this._inst.GetPropertyValue('italic'));

      const baseFontSize = this._inst.GetPropertyValue('baseFontSize');
      this._webglText.SetFontSize(baseFontSize);

      if (!this._webglText.GetTexture()) return;

      const width = this._inst.GetWidth();
      const height = this._inst.GetHeight();
      const wrapWidth = this._webglText.GetTextWidth();
      const wrapHeight = this._webglText.GetTextHeight();
      const forceAdapt = this._inst.GetPropertyValue('forceAdapt');

      if (forceAdapt || width < wrapWidth || height < wrapHeight) {
        if (width / height < wrapWidth / wrapHeight) {
          this._calculatedFontSize = Math.floor(baseFontSize * (width / wrapWidth));
        } else {
          this._calculatedFontSize = Math.floor(baseFontSize * (height / wrapHeight));
        }
        this._webglText.SetFontSize(this._calculatedFontSize);
      }

      this._dirtyText = false;
    }

    const texture = this._webglText.GetTexture();
    if (!texture) return;

    iRenderer.SetTextureFillMode();
    iRenderer.SetTexture(texture);
    iRenderer.ResetColor();
    iRenderer.Quad3(quad, this._webglText.GetTexRect());
  }

  OnPropertyChanged(id, value) {
    if (!this._webglText) return;
    this._dirtyText = true;
  }

  LoadC2Property(name, valueString) {
    return false;
  }
};
