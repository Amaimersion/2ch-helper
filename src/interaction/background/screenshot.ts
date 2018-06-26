import {ScreenshotKey, UserSettings} from "@modules/storage-sync";
import {Settings} from "./settings";
import {Download} from "./download";


interface Coordinate {
    top: number;
    bottom: number;
    height: number;
    width: number;
    left: number;
    right: number;
}

interface Data {
    coordinates: Coordinate[];
    uri: string;
}

class ScreenshotImage {
    private _uri: string = undefined;
    private _image: HTMLImageElement = undefined;

    public get image(): HTMLImageElement {
        return this._image;
    }

    constructor(uri: string) {
        this._uri = uri;
    }

    public createImage(): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            this._image = new Image();

            this._image.onload = () => {
                return resolve(this._image);
            };
            this._image.onerror = (event) => {
                return reject(event.error);
            };

            this._image.src = this._uri;
        });
    }

    public async cropImage(coordinate: Coordinate, format: string, quality: number): Promise<ScreenshotImage> {
        if (!this._image) {
            await this.createImage();
        }

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = coordinate.height;
        canvas.width = coordinate.width;

        context.drawImage(
            this._image,
            coordinate.left,
            coordinate.top,
            coordinate.width,
            coordinate.height,
            0,
            0,
            coordinate.width,
            coordinate.height
        );

        const croppedURI = canvas.toDataURL(`image/${format}`, quality);
        const croppedImage = new ScreenshotImage(croppedURI);
        await croppedImage.createImage();

        return croppedImage;
    }
}

export abstract class Screenshot {
    private static _settings: UserSettings = undefined;
    private static _data: Data[] = [];

    public static async captureCoordinates(coordinates: Coordinate[], settingKey: ScreenshotKey): Promise<void> {
        if (!this._settings) {
            this._settings = await this.getSettings();
        }

        const uri = await this.captureTab(settingKey);
        this._data.push({
            coordinates: coordinates,
            uri: uri
        });
    }

    public static async createFullImage(settingKey: ScreenshotKey): Promise<void> {
        try {
            await this._createFullImage(settingKey);
        } catch (error) {
            throw error;
        } finally {
            this.clearData();
        }
    }

    protected static captureTab(settingKey: ScreenshotKey): Promise<string> {
        return new Promise((resolve, reject) => {
            const options: chrome.tabs.CaptureVisibleTabOptions = {
                format: this.getFormat(settingKey),
                quality: this.getQuality(settingKey, 1)
            };

            chrome.tabs.captureVisibleTab(options, (uri) => {
                if (uri) {
                    return resolve(uri);
                } else {
                    return reject("URI is undefined.");
                }
            });
        });
    }

    protected static async _createFullImage(settingKey: ScreenshotKey): Promise<void> {
        if (!this._data.length) {
            throw new Error("Data is empty.");
        }

        if (!this._settings) {
            this._settings = await this.getSettings();
        }

        const format = this.getFormat(settingKey);
        const quality = this.getQuality(settingKey, 100);
        const croppedImages: HTMLImageElement[] = [];

        for (let data of this._data) {
            const fullImage = new ScreenshotImage(data.uri);

            for (let coordinate of data.coordinates) {
                const croppedImage = await fullImage.cropImage(coordinate, format, quality);
                croppedImages.push(croppedImage.image);
            }
        }

        const mergedImageURI = await this.mergeImages(croppedImages, settingKey);
        const fileName = (
            `${this._settings[settingKey].name}.${this._settings[settingKey].format}`
        );
        const downloadParameters: chrome.downloads.DownloadOptions = {
            url: mergedImageURI,
            filename: fileName
        };

        await Download.download(downloadParameters);
    }

    protected static mergeImages(images: HTMLImageElement[], settingKey: ScreenshotKey): string {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const paddingTop = this._settings[settingKey].paddingTop;
        const paddingBottom = this._settings[settingKey].paddingBottom;
        const paddingLeft = this._settings[settingKey].paddingLeft;
        const paddingRight = this._settings[settingKey].paddingRight;
        const paddingBetween = this._settings[settingKey].paddingBetween || 0;

        let totalHeight = 0;
        let maxWidth = 0;

        for (let image of images) {
            totalHeight += image.height;

            if (maxWidth < image.width) {
                maxWidth = image.width;
            }
        }

        totalHeight += paddingTop + paddingBottom + paddingBetween * (images.length - 1);
        maxWidth += paddingLeft + paddingRight;

        canvas.height = totalHeight;
        canvas.width = maxWidth;

        context.fillStyle = this._settings[settingKey].fillColor;
        context.fillRect(0, 0, canvas.width, canvas.height);

        let offsetY = paddingTop;

        for (let i = 0; i !== images.length; i++) {
            const image = images[i];
            const isLast = (i === images.length - 1);

            context.drawImage(
                image,
                paddingLeft,
                offsetY
            );

            offsetY += image.height + (isLast ? 0 : paddingBetween);
        }

        const imageFormat = this.getFormat(settingKey);
        const imageQuality = this.getQuality(settingKey, 100);

        const dataURL = canvas.toDataURL(`image/${imageFormat}`, imageQuality);

        return dataURL;
    }

    protected static clearData(): void {
        this._data = [];
    }

    protected static getSettings(): Promise<UserSettings> {
        return Settings.get("settingsScreenshot");
    }

    protected static getFormat(settingKey: ScreenshotKey): string {
        if (!this._settings) {
            throw new Error("Settings is undefined.");
        }

        if (this._settings[settingKey].format === "jpg") {
            return "jpeg";
        } else {
            return this._settings[settingKey].format;
        }
    }

    protected static getQuality(settingKey: ScreenshotKey, normalize: number): number {
        if (!this._settings) {
            throw new Error("Settings is undefined.");
        }

        return (this._settings[settingKey].quality / normalize);
    }
}
