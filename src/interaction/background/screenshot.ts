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

    public async cropImage(coordinate: Coordinate): Promise<HTMLImageElement> {
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

        this._uri = canvas.toDataURL("image/jpeg", 1);
        const croppedImage = await this.createImage();

        return croppedImage;
    }
}

export abstract class Screenshot {
    protected static _data: Data[] = [];

    public static async handleCoordinates(coordinates: Coordinate[]): Promise<void> {
        const uri = await this.captureTab();
        this._data.push({
            coordinates: coordinates,
            uri: uri
        });
    }

    public static async createFullImage(): Promise<void> {
        if (!this._data.length) {
            throw new Error("Data is empty.");
        }

        const croppedImages: HTMLImageElement[] = [];

        for (let data of this._data) {
            const fullImage = new ScreenshotImage(data.uri);

            for (let coordinate of data.coordinates) {
                const croppedImage = await fullImage.cropImage(coordinate);
                croppedImages.push(croppedImage);
            }
        }

        this._data = [];
        const fullImage = await this.mergeImages(croppedImages);

        await new Promise((resolve) => {
            chrome.downloads.download({url: fullImage, filename: "posts.jpg"}, () => {
                return resolve();
            });
        });
    }

    protected static captureTab(): Promise<string> {
        return new Promise((resolve, reject) => {
            chrome.tabs.captureVisibleTab({format: "jpeg", quality: 100}, (uri) => {
                if (!uri) {
                    return reject("URI is undefined.");
                }

                return resolve(uri);
            });
        });
    }

    protected static mergeImages(images: HTMLImageElement[]): string {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        let totalHeight = 0;
        let maxWidth = 0;

        for (let image of images) {
            totalHeight += image.height;

            if (maxWidth < image.width) {
                maxWidth = image.width;
            }
        }

        canvas.height = totalHeight;
        canvas.width = maxWidth;

        let offsetY = 0;

        for (let image of images) {
            context.drawImage(
                image,
                0,
                offsetY
            );
            offsetY += image.height;
        }

        // can be also webp
        const dataURL = canvas.toDataURL("image/jpeg", 1);

        return dataURL;
    }
}
