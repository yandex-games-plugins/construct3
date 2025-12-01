const C3 = globalThis.C3;

C3.Plugins.yagames_adaptivetext.Cnds = {
    CompareText(text) {
        return this.GetText() === text;
    },
    IsItalic() {
        return this.GetItalic();
    },
    IsBold() {
        return this.GetBold();
    },
};
