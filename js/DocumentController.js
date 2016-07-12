/*
Copyright (C) 2016 Apple Inc. All Rights Reserved.
See LICENSE.txt for this sample’s licensing information

Abstract:
This class handles fetching and presenting simple templates.
*/

// Registry of attribute name used to define the URL to template (e.g. documentURL or menuBarDocumentURL)
// to controller type (e.g. DocumentController or MenuBarController)
const attributeToController = {};
const attributeKeys = [];

function registerAttributeName(type, func) {
    attributeToController[type] = func;
    attributeKeys.push(type);
}

function resolveControllerFromElement(elem) {
    for (let key of attributeKeys) {
        if (elem.hasAttribute(key)) {
            return {
                type: attributeToController[key],
                url: elem.getAttribute(key)
            };
        }
    }
}

class DocumentController {

    constructor(documentLoader, documentURL, loadingDocument) {
        this.handleEvent = this.handleEvent.bind(this);
        this._documentLoader = documentLoader;
        this.fetchDocument(documentURL, loadingDocument);
    }

    fetchDocument(documentURL, loadingDocument) {
        this._documentLoader.fetch({
            url: documentURL,
            success: (document) => {
                // Add the event listener for document
                this.setupDocument(document);
                // Allow subclass to do custom handling for this document
                this.handleDocument(document, loadingDocument);
            },
            error: (xhr) => {
                const alertDocument = createLoadErrorAlertDocument(documentURL, xhr, false);
                this.handleDocument(alertDocument, loadingDocument);
            }
        });
    }

    setupDocument(document) {
        document.addEventListener("select", this.handleEvent);
        document.addEventListener("play", this.handleEvent);
    }

    handleDocument(document, loadingDocument) {
        if (loadingDocument) {
            navigationDocument.replaceDocument(document, loadingDocument);
        } else {
            navigationDocument.pushDocument(document);
        }
    }

    handleEvent(event) {
        const target = event.target;

        let videoURL = target.getAttribute("videoURL");
        if(videoURL) {
            //2
            var videoPlayer = new Player();
            var videoPlaylist = new Playlist();
            var videoMediaItem = new MediaItem("video", videoURL);

            videoPlayer.playlist = videoPlaylist;
            videoPlayer.playlist.push(videoMediaItem);
            videoPlayer.present();
        }

        let audioURL = target.getAttribute("audioURL");
        if(audioURL) {
            //2
            var audioPlayer = new Player();
            var audioPlaylist = new Playlist();
            var audioMediaItem = new MediaItem("audio", audioURL);

            audioMediaItem.artworkImageURL = target.getAttribute("artworkImageURL");
            audioPlayer.playlist = audioPlaylist;
            audioPlayer.playlist.push(audioMediaItem);
            audioPlayer.present();
        }

        const controllerOptions = resolveControllerFromElement(target);
        if (controllerOptions) {
            const controllerClass = controllerOptions.type;
            const documentURL = controllerOptions.url;
            var loadingDocument;
            if (!controllerClass.preventLoadingDocument) {
                loadingDocument = createLoadingDocument();
                navigationDocument.pushDocument(loadingDocument);
            }
            // Create the subsequent controller based on the atribute and its value. Controller would handle its presentation.
            new controllerClass(this._documentLoader, documentURL, loadingDocument);
        }
        else if (target.tagName === 'description') {
            // Handle description tag, if no URL was specified
            const body = target.textContent;
            const alertDocument = createDescriptiveAlertDocument('', body);
            navigationDocument.presentModal(alertDocument);
        }
    }
}

registerAttributeName('documentURL', DocumentController);
