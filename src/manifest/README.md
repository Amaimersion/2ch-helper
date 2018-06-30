# This folder contains a manifest files for a browsers

## Files description

- `common.json` - a common manifest for all platforms.
- `chromium.json` - a manifest only for chromium platforms.
- `firefox.json` - a manifest only for firefox platforms.

## Chromium permissions description

The manifest for chromium platforms takes `pageCapture` permission. It is necessary for page downloading (in `.mhtml` format). After getting this permission an extension has this permission description:

> Read and change all your data on the websites you visit.

It is a bit scary, yep. However, we do not have a choice (as far as I know). Neither `activeTab` nor `*://2ch.hk/*` cannot provide this functionality.

Firefox doesn't support a `pageCapture`.

## Firefox permissions description

In some extension rights Mozilla Firefox behaves much stricter than Google Chrome.

`tabs`
[#1](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs)

> You can use most of this API without any special permission. However, to access Tab.url, Tab.title, and Tab.faviconUrl, you need to have the tabs permission. In Firefox this also means you need "tabs" to query by URL.

`<all_urls>`
[#1](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/tabs/captureVisibleTab)

> You must have the <all_urls> permission to use this method (captureVisibleTab). (Alternately, Chrome allows use of this method with the activeTab permission and a qualifying user gesture.)

`Downloading screenshot through Blob`
[#1](https://bugzilla.mozilla.org/show_bug.cgi?id=1271345)
[#2](https://bugzilla.mozilla.org/show_bug.cgi?id=1272556)
[#3](https://stackoverflow.com/questions/40269862/save-data-uri-as-file-using-downloads-download-api#answer-40279050)

> At present, it is only possible to download/open pages if the extension is allowed to load the URL. In Firefox, data:-URLs inherit the principal from the caller (i.e. the origin), and out of caution that is blocked.
