interface Coordinate {
    top: number,
    bottom: number,
    height: number,
    width: number,
    left: number,
    right: number
};

interface Data {
    coordinates: Coordinate[];
    uri: string;
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
        const croppedImages = [];

        for (let data of this._data) {
            const fullImage = await this.createImage(data.uri);

            for (let coordinate of data.coordinates) {
                const croppedImage = await this.cropImage(fullImage, coordinate);
                croppedImages.push(croppedImage);
            }
        }

        const fullImage = await this.mergeImages(croppedImages);

        await new Promise((resolve) => {
            chrome.downloads.download({url: fullImage, filename: "posts.jpg"}, () => {
                return resolve();
            });
        });

        this._data = [];
    }

    protected static captureTab(): Promise<string> {
        return new Promise((resolve) => {
            chrome.tabs.captureVisibleTab({format: "jpeg", quality: 100}, (uri) => {
                return resolve(uri);
            });
        });
    }

    protected static createImage(src: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                return resolve(image);
            };
            image.onerror = () => {
                return reject();
            };

            image.src = src;
        });
    }

    protected static async cropImage(image: HTMLImageElement, coordinate: Coordinate): Promise<HTMLImageElement> {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        canvas.height = coordinate.height;
        canvas.width = coordinate.width;

        context.drawImage(
            image,
            coordinate.left,
            coordinate.top,
            coordinate.width,
            coordinate.height,
            0,
            0,
            coordinate.width,
            coordinate.height
        );

        const dataURL = canvas.toDataURL("image/jpeg", 1);
        const croppedImage = await this.createImage(dataURL);

        return croppedImage;
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
