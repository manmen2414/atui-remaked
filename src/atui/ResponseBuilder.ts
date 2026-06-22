import {
  AtuiBlankResponse,
  AtuiErrorResponse,
  AtuiHTMLResponse,
  AtuiMarkdownResponse,
  AtuiOpenPageResponse,
  AtuiRequest,
  AtuiResponse,
} from "./types";

export class AtuiResponseBuilder {
  req: AtuiRequest;
  constructor(req: AtuiRequest) {
    this.req = req;
  }
  _baseResponse() {
    return {
      request: this.req,
      requestId: this.req.id,
      finish: false,
    };
  }
  _baseFuncs<ResType extends AtuiResponse>(res: ResType) {
    return {
      res,
      finish: function () {
        this.res.finish = true;
        return this;
      },
    };
  }
  md(content: string) {
    const obj: AtuiMarkdownResponse = {
      type: "md",
      content,
      ...this._baseResponse(),
    };
    return this._baseFuncs(obj);
  }
  html(content: string) {
    const obj: AtuiHTMLResponse = {
      type: "html",
      content,
      ...this._baseResponse(),
    };
    return this._baseFuncs(obj);
  }
  error(content: string) {
    const obj: AtuiErrorResponse = {
      type: "error",
      content,
      ...this._baseResponse(),
    };
    return this._baseFuncs(obj);
  }
  page(url: string) {
    const obj: AtuiOpenPageResponse = {
      type: "page",
      url,
      target: "newpage",
      ...this._baseResponse(),
    };
    return {
      ...this._baseFuncs(obj),
      modeReplace: function () {
        this.res.target = "replace";
        return this;
      },
      modePopup: function () {
        this.res.target = "popup";
        return this;
      },
      popupTitle: function (title: string) {
        this.res.popupInfo ??= {};
        this.res.popupInfo.title = title;
        return this;
      },
      popupFeatures: function (features: string) {
        this.res.popupInfo ??= {};
        this.res.popupInfo.features = features;
        return this;
      },
    };
  }
  blank() {
    const obj: AtuiBlankResponse = {
      type: "blank",
      ...this._baseResponse(),
    };
    return this._baseFuncs(obj);
  }
}
