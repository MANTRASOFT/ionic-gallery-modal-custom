import { Component, Directive, ElementRef, EventEmitter, Input, NgModule, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Gesture, IonicModule, NavParams, Platform, ViewController } from 'ionic-angular/index';
import { Subject } from 'rxjs/Subject';

var ZoomableImage = (function () {
    function ZoomableImage() {
        this.disableScroll = new EventEmitter();
        this.enableScroll = new EventEmitter();
        this.scale = 1;
        this.scaleStart = 1;
        this.maxScale = 3;
        this.minScale = 1;
        this.minScaleBounce = 0.2;
        this.maxScaleBounce = 0.35;
        this.imageWidth = 0;
        this.imageHeight = 0;
        this.position = {
            x: 0,
            y: 0,
        };
        this.scroll = {
            x: 0,
            y: 0,
        };
        this.centerRatio = {
            x: 0,
            y: 0,
        };
        this.centerStart = {
            x: 0,
            y: 0,
        };
        this.dimensions = {
            width: 0,
            height: 0,
        };
        this.panCenterStart = {
            x: 0, y: 0,
        };
        this.containerStyle = {};
        this.imageStyle = {};
    }
    /**
     * @return {?}
     */
    ZoomableImage.prototype.ngOnInit = function () {
        var _this = this;
        // Get the scrollable element
        this.scrollableElement = this.ionScrollContainer.nativeElement.querySelector('.scroll-content');
        // Attach events
        this.attachEvents();
        // Listen to parent resize
        this.resizeSubscription = this.parentSubject.subscribe(function (event) {
            _this.resize(event);
        });
        // Resize the zoomable image
        this.resize(false);
    };
    /**
     * @return {?}
     */
    ZoomableImage.prototype.ngOnDestroy = function () {
        this.scrollableElement.removeEventListener('scroll', this.scrollListener);
        this.resizeSubscription.unsubscribe();
    };
    /**
     * Attach the events to the items
     * @return {?}
     */
    ZoomableImage.prototype.attachEvents = function () {
        // Scroll event
        this.scrollListener = this.scrollEvent.bind(this);
        this.scrollableElement.addEventListener('scroll', this.scrollListener);
    };
    /**
     * Called every time the window gets resized
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.resize = function (event) {
        // Set the wrapper dimensions first
        this.setWrapperDimensions(event.width, event.height);
        // Get the image dimensions
        this.setImageDimensions();
    };
    /**
     * Set the wrapper dimensions
    
    \@param  {number} width
    \@param  {number} height
     * @param {?} width
     * @param {?} height
     * @return {?}
     */
    ZoomableImage.prototype.setWrapperDimensions = function (width, height) {
        this.dimensions.width = width || window.innerWidth;
        this.dimensions.height = height || window.innerHeight;
    };
    /**
     * Get the real image dimensions and other useful stuff
     * @return {?}
     */
    ZoomableImage.prototype.setImageDimensions = function () {
        if (!this.imageElement) {
            this.imageElement = new Image();
            this.imageElement.src = this.src;
            this.imageElement.onload = this.saveImageDimensions.bind(this);
            return;
        }
        this.saveImageDimensions();
    };
    /**
     * Save the image dimensions (when it has the image)
     * @return {?}
     */
    ZoomableImage.prototype.saveImageDimensions = function () {
        var /** @type {?} */ width = this.imageElement['width'];
        var /** @type {?} */ height = this.imageElement['height'];
        if (width / height > this.dimensions.width / this.dimensions.height) {
            this.imageWidth = this.dimensions.width;
            this.imageHeight = height / width * this.dimensions.width;
        }
        else {
            this.imageHeight = this.dimensions.height;
            this.imageWidth = width / height * this.dimensions.height;
        }
        this.maxScale = Math.max(width / this.imageWidth - this.maxScaleBounce, 1);
        this.imageStyle.width = this.imageWidth + "px";
        this.imageStyle.height = this.imageHeight + "px";
        this.displayScale();
    };
    /**
     * While the user is pinching
    
    \@param  {Hammer.Event} event
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.pinchEvent = function (event) {
        var /** @type {?} */ scale = this.scaleStart * event.scale;
        if (scale > this.maxScale) {
            scale = this.maxScale + (1 - this.maxScale / scale) * this.maxScaleBounce;
        }
        else if (scale < this.minScale) {
            scale = this.minScale - (1 - scale / this.minScale) * this.minScaleBounce;
        }
        this.scale = scale;
        this.displayScale();
        event.preventDefault();
    };
    /**
     * When the user starts pinching
    
    \@param  {Hammer.Event} event
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.pinchStartEvent = function (event) {
        this.scaleStart = this.scale;
        this.setCenter(event);
    };
    /**
     * When the user stops pinching
    
    \@param  {Hammer.Event} event
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.pinchEndEvent = function (event) {
        this.checkScroll();
        if (this.scale > this.maxScale) {
            this.animateScale(this.maxScale);
        }
        else if (this.scale < this.minScale) {
            this.animateScale(this.minScale);
        }
    };
    /**
     * When the user double taps on the photo
    
    \@param  {Hammer.Event} event
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.doubleTapEvent = function (event) {
        this.setCenter(event);
        var /** @type {?} */ scale = this.scale > 1 ? 1 : 2.5;
        if (scale > this.maxScale) {
            scale = this.maxScale;
        }
        this.animateScale(scale);
    };
    /**
     * Called when the user is panning
    
    \@param  {Hammer.Event} event
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.panEvent = function (event) {
        console.log('panning');
        // calculate center x,y since pan started
        var /** @type {?} */ x = Math.max(Math.floor(this.panCenterStart.x + event.deltaX), 0);
        var /** @type {?} */ y = Math.max(Math.floor(this.panCenterStart.y + event.deltaY), 0);
        this.centerStart.x = x;
        this.centerStart.y = y;
        if (event.isFinal) {
            this.panCenterStart.x = x;
            this.panCenterStart.y = y;
        }
        this.displayScale();
    };
    /**
     * When the user is scrolling
    
    \@param  {Event} event
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.scrollEvent = function (event) {
        this.scroll.x = event.target.scrollLeft;
        this.scroll.y = event.target.scrollTop;
    };
    /**
     * Set the startup center calculated on the image (along with the ratio)
    
    \@param  {Hammer.Event} event
     * @param {?} event
     * @return {?}
     */
    ZoomableImage.prototype.setCenter = function (event) {
        var /** @type {?} */ realImageWidth = this.imageWidth * this.scale;
        var /** @type {?} */ realImageHeight = this.imageHeight * this.scale;
        this.centerStart.x = Math.max(event.center.x - this.position.x * this.scale, 0);
        this.centerStart.y = Math.max(event.center.y - this.position.y * this.scale, 0);
        this.panCenterStart.x = Math.max(event.center.x - this.position.x * this.scale, 0);
        this.panCenterStart.y = Math.max(event.center.y - this.position.y * this.scale, 0);
        this.centerRatio.x = Math.min((this.centerStart.x + this.scroll.x) / realImageWidth, 1);
        this.centerRatio.y = Math.min((this.centerStart.y + this.scroll.y) / realImageHeight, 1);
    };
    /**
     * Calculate the position and set the proper scale to the element and the
    container
     * @return {?}
     */
    ZoomableImage.prototype.displayScale = function () {
        var /** @type {?} */ realImageWidth = this.imageWidth * this.scale;
        var /** @type {?} */ realImageHeight = this.imageHeight * this.scale;
        this.position.x = Math.max((this.dimensions.width - realImageWidth) / (2 * this.scale), 0);
        this.position.y = Math.max((this.dimensions.height - realImageHeight) / (2 * this.scale), 0);
        this.imageStyle.transform = "scale(" + this.scale + ") translate(" + this.position.x + "px, " + this.position.y + "px)";
        this.containerStyle.width = realImageWidth + "px";
        this.containerStyle.height = realImageHeight + "px";
        this.scroll.x = this.centerRatio.x * realImageWidth - this.centerStart.x;
        this.scroll.y = this.centerRatio.y * realImageWidth - this.centerStart.y;
        // Set scroll of the ion scroll
        this.scrollableElement.scrollLeft = this.scroll.x;
        this.scrollableElement.scrollTop = this.scroll.y;
    };
    /**
     * Check wether to disable or enable scroll and then call the events
     * @return {?}
     */
    ZoomableImage.prototype.checkScroll = function () {
        if (this.scale > 1) {
            this.disableScroll.emit({});
        }
        else {
            this.enableScroll.emit({});
        }
    };
    /**
     * Animates to a certain scale (with ease)
    
    \@param  {number} scale
     * @param {?} scale
     * @return {?}
     */
    ZoomableImage.prototype.animateScale = function (scale) {
        this.scale += (scale - this.scale) / 5;
        if (Math.abs(this.scale - scale) <= 0.1) {
            this.scale = scale;
        }
        this.displayScale();
        if (Math.abs(this.scale - scale) > 0.1) {
            window.requestAnimationFrame(this.animateScale.bind(this, scale));
        }
        else {
            this.checkScroll();
        }
    };
    return ZoomableImage;
}());
ZoomableImage.decorators = [
    { type: Component, args: [{
                selector: 'zoomable-image',
                template: "<ion-scroll #ionScrollContainer scrollX=\"true\" scrollY=\"true\" zoom=\"false\"> <div class=\"image\" touch-events direction=\"y\" (pinch)=\"pinchEvent($event)\" (pinchstart)=\"pinchStartEvent($event)\" (pinchend)=\"pinchEndEvent($event)\" (doubletap)=\"doubleTapEvent($event)\" (onpan)=\"panEvent($event)\" [ngStyle]=\"containerStyle\" > <img src=\"{{ src }}\" alt=\"\" [ngStyle]=\"imageStyle\" /> </div> </ion-scroll> ",
                styles: [":host { width: 100%; height: 100%; } :host ion-scroll { width: 100%; height: 100%; text-align: left; white-space: nowrap; } :host ion-scroll /deep/ .scroll-zoom-wrapper { width: 100%; height: 100%; } :host ion-scroll .image { display: inline-block; min-width: 100%; min-height: 100%; transform-origin: left top; background-repeat: no-repeat; background-position: center center; background-size: contain; text-align: left; vertical-align: top; } :host ion-scroll .image img { min-width: 0; max-width: none; transform-origin: left top; pointer-events: none; } "],
            },] },
];
/**
 * @nocollapse
 */
ZoomableImage.ctorParameters = function () { return []; };
ZoomableImage.propDecorators = {
    'ionScrollContainer': [{ type: ViewChild, args: ['ionScrollContainer', { read: ElementRef },] },],
    'src': [{ type: Input },],
    'parentSubject': [{ type: Input },],
    'disableScroll': [{ type: Output },],
    'enableScroll': [{ type: Output },],
};

var GalleryModal = (function () {
    /**
     * @param {?} viewCtrl
     * @param {?} params
     * @param {?} element
     * @param {?} platform
     */
    function GalleryModal(viewCtrl, params, element, platform) {
        this.viewCtrl = viewCtrl;
        this.element = element;
        this.platform = platform;
        this.sliderDisabled = false;
        this.initialSlide = 0;
        this.currentSlide = 0;
        this.sliderLoaded = false;
        this.closeIcon = 'arrow-back';
        this.parentSubject = new Subject();
        this.width = 0;
        this.height = 0;
        this.slidesStyle = {
            visibility: 'hidden',
        };
        this.modalStyle = {
            backgroundColor: 'rgba(0, 0, 0, 1)',
        };
        this.photos = params.get('photos') || [];
        this.closeIcon = params.get('closeIcon') || 'arrow-back';
        this.initialSlide = params.get('initialSlide') || 0;
    }
    /**
     * Closes the modal (when user click on CLOSE)
     * @return {?}
     */
    GalleryModal.prototype.dismiss = function () {
        this.viewCtrl.dismiss();
    };
    /**
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.resize = function (event) {
        this.slider.update();
        this.width = this.element.nativeElement.offsetWidth;
        this.height = this.element.nativeElement.offsetHeight;
        this.parentSubject.next({
            width: this.width,
            height: this.height,
        });
    };
    /**
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.orientationChange = function (event) {
        var _this = this;
        // TODO: See if you can remove timeout
        window.setTimeout(function () {
            _this.resize(event);
        }, 150);
    };
    /**
     * When the modal has entered into view
     * @return {?}
     */
    GalleryModal.prototype.ionViewDidEnter = function () {
        this.resize(false);
        this.sliderLoaded = true;
        this.slidesStyle.visibility = 'visible';
    };
    /**
     * Disables the scroll through the slider
    
    \@param  {Event} event
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.disableScroll = function (event) {
        if (!this.sliderDisabled) {
            this.currentSlide = this.slider.getActiveIndex();
            this.sliderDisabled = true;
        }
    };
    /**
     * Enables the scroll through the slider
    
    \@param  {Event} event
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.enableScroll = function (event) {
        if (this.sliderDisabled) {
            this.slider.slideTo(this.currentSlide, 0, false);
            this.sliderDisabled = false;
        }
    };
    /**
     * Called when the user pans up/down
    
    \@param  {Hammer.Event} event
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.panUpDownEvent = function (event) {
        var /** @type {?} */ ratio = (event.distance / (this.height / 2));
        if (ratio > 1) {
            ratio = 1;
        }
        else if (ratio < 0) {
            ratio = 0;
        }
        var /** @type {?} */ scale = 1 - (ratio * 0.2);
        var /** @type {?} */ opacity = 1 - (ratio * 0.2);
        var /** @type {?} */ backgroundOpacity = 1 - (ratio * 0.8);
        this.slidesStyle.transform = "translate(0, " + event.deltaY + "px) scale(" + scale + ")";
        this.slidesStyle.opacity = opacity;
        this.modalStyle.backgroundColor = "rgba(0, 0, 0, " + backgroundOpacity + ")";
    };
    /**
     * Called when the user stopped panning up/down
    
    \@param  {Hammer.Event} event
     * @param {?} event
     * @return {?}
     */
    GalleryModal.prototype.panEndEvent = function (event) {
        this.slidesStyle.transform = 'none';
        this.slidesStyle.opacity = 1;
        this.modalStyle.backgroundColor = 'rgba(0, 0, 0, 1)';
    };
    return GalleryModal;
}());
GalleryModal.decorators = [
    { type: Component, args: [{
                selector: 'gallery-modal',
                template: "<ion-content class=\"gallery-modal\" #content no-bounce [ngStyle]=\"modalStyle\" (window:resize)=\"resize($event)\" (window:orientationchange)=\"orientationChange($event)\" > <button class=\"close-button\" ion-button icon-only (click)=\"dismiss()\"> <ion-icon name=\"{{ closeIcon }}\"></ion-icon> </button> <!-- Initial image while modal is animating --> <div class=\"image-on-top\" #image [ngStyle]=\"{ 'background-image': 'url(' + photos[initialSlide].url + ')'}\" [hidden]=\"sliderLoaded\"> &nbsp; </div> <!-- Slider with images --> <ion-slides class=\"slider\" #slider *ngIf=\"photos.length\" [initialSlide]=\"initialSlide\" [ngStyle]=\"slidesStyle\" > <ion-slide *ngFor=\"let photo of photos;\"> <zoomable-image src=\"{{ photo.url }}\" [ngClass]=\"{ 'swiper-no-swiping': sliderDisabled }\" (disableScroll)=\"disableScroll($event)\" (enableScroll)=\"enableScroll($event)\" [parentSubject]=\"parentSubject\" ></zoomable-image> </ion-slide> </ion-slides> </ion-content> ",
                styles: [":host .gallery-modal { position: relative; } :host .gallery-modal .close-button { position: absolute; top: 10px; left: 5px; background: none; z-index: 10; } :host .gallery-modal .close-button.button-ios { top: 20px; } :host .gallery-modal .slider /deep/ .slide-zoom { height: 100%; } :host .gallery-modal .image-on-top { display: block; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-repeat: no-repeat; background-position: center center; background-size: contain; z-index: 10; } "],
            },] },
];
/**
 * @nocollapse
 */
GalleryModal.ctorParameters = function () { return [
    { type: ViewController, },
    { type: NavParams, },
    { type: ElementRef, },
    { type: Platform, },
]; };
GalleryModal.propDecorators = {
    'slider': [{ type: ViewChild, args: ['slider',] },],
    'content': [{ type: ViewChild, args: ['content',] },],
};

var TouchEventsDirective = (function () {
    /**
     * @param {?} el
     */
    function TouchEventsDirective(el) {
        this.el = el;
        this.direction = 'x';
        this.threshold = 10;
        this.pinch = new EventEmitter();
        this.pinchstart = new EventEmitter();
        this.pinchend = new EventEmitter();
        this.onpan = new EventEmitter();
        this.panup = new EventEmitter();
        this.pandown = new EventEmitter();
        this.panstart = new EventEmitter();
        this.panend = new EventEmitter();
        this.pancancel = new EventEmitter();
        this.doubletap = new EventEmitter();
    }
    /**
     * @return {?}
     */
    TouchEventsDirective.prototype.ngOnInit = function () {
        var _this = this;
        this.gestureListener = new Gesture(this.el.nativeElement, {
            domEvents: false,
            direction: this.direction,
            threshold: this.threshold,
        });
        this.gestureListener.listen();
        this.gestureListener.on('pinch', function (event) {
            _this.pinch.emit(event);
        });
        this.gestureListener.on('pinchstart', function (event) {
            _this.pinchstart.emit(event);
        });
        this.gestureListener.on('pinchend', function (event) {
            _this.pinchend.emit(event);
        });
        this.gestureListener.on('pan', function (event) {
            _this.onpan.emit(event);
        });
        this.gestureListener.on('panup', function (event) {
            _this.panup.emit(event);
        });
        this.gestureListener.on('pandown', function (event) {
            _this.pandown.emit(event);
        });
        this.gestureListener.on('panstart', function (event) {
            _this.panstart.emit(event);
        });
        this.gestureListener.on('panend', function (event) {
            _this.panend.emit(event);
        });
        this.gestureListener.on('pancancel', function (event) {
            _this.pancancel.emit(event);
        });
        this.gestureListener.on('doubletap', function (event) {
            _this.doubletap.emit(event);
        });
    };
    /**
     * @return {?}
     */
    TouchEventsDirective.prototype.ngOnDestroy = function () {
        this.gestureListener.destroy();
    };
    return TouchEventsDirective;
}());
TouchEventsDirective.decorators = [
    { type: Directive, args: [{
                selector: '[touch-events]'
            },] },
];
/**
 * @nocollapse
 */
TouchEventsDirective.ctorParameters = function () { return [
    { type: ElementRef, },
]; };
TouchEventsDirective.propDecorators = {
    'direction': [{ type: Input },],
    'threshold': [{ type: Input },],
    'pinch': [{ type: Output },],
    'pinchstart': [{ type: Output },],
    'pinchend': [{ type: Output },],
    'onpan': [{ type: Output },],
    'panup': [{ type: Output },],
    'pandown': [{ type: Output },],
    'panstart': [{ type: Output },],
    'panend': [{ type: Output },],
    'pancancel': [{ type: Output },],
    'doubletap': [{ type: Output },],
};

var GalleryModalModule = (function () {
    function GalleryModalModule() {
    }
    return GalleryModalModule;
}());
GalleryModalModule.decorators = [
    { type: NgModule, args: [{
                imports: [
                    CommonModule,
                    IonicModule.forRoot(TouchEventsDirective),
                    IonicModule.forRoot(ZoomableImage),
                    IonicModule.forRoot(GalleryModal),
                ],
                declarations: [
                    ZoomableImage,
                    GalleryModal,
                    TouchEventsDirective,
                ],
                exports: [
                    ZoomableImage,
                    GalleryModal,
                ],
                entryComponents: [
                    GalleryModal,
                ],
            },] },
];
/**
 * @nocollapse
 */
GalleryModalModule.ctorParameters = function () { return []; };

export { GalleryModalModule, ZoomableImage, GalleryModal };
