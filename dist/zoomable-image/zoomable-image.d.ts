import { OnInit, OnDestroy, EventEmitter, ElementRef } from '@angular/core';
import { Subject } from 'rxjs/Subject';
export declare class ZoomableImage implements OnInit, OnDestroy {
    ionScrollContainer: ElementRef;
    src: string;
    alt: string;
    parentSubject: Subject<any>;
    disableScroll: EventEmitter<{}>;
    enableScroll: EventEmitter<{}>;
    private scrollableElement;
    private scrollListener;
    private scale;
    private scaleStart;
    private maxScale;
    private minScale;
    private minScaleBounce;
    private maxScaleBounce;
    private imageWidth;
    private imageHeight;
    private position;
    private scroll;
    private centerRatio;
    private centerStart;
    private dimensions;
    private panCenterStart;
    private imageElement;
    private containerStyle;
    private imageStyle;
    private resizeSubscription;
    constructor();
    ngOnInit(): void;
    ngOnDestroy(): void;
    /**
     * Attach the events to the items
     */
    private attachEvents();
    /**
     * Called every time the window gets resized
     */
    resize(event: any): void;
    /**
     * Set the wrapper dimensions
     *
     * @param  {number} width
     * @param  {number} height
     */
    private setWrapperDimensions(width, height);
    /**
     * Get the real image dimensions and other useful stuff
     */
    private setImageDimensions();
    /**
     * Save the image dimensions (when it has the image)
     */
    private saveImageDimensions();
    /**
     * While the user is pinching
     *
     * @param  {Hammer.Event} event
     */
    private pinchEvent(event);
    /**
     * When the user starts pinching
     *
     * @param  {Hammer.Event} event
     */
    private pinchStartEvent(event);
    /**
     * When the user stops pinching
     *
     * @param  {Hammer.Event} event
     */
    private pinchEndEvent(event);
    /**
     * When the user double taps on the photo
     *
     * @param  {Hammer.Event} event
     */
    private doubleTapEvent(event);
    /**
     * Called when the user is panning
     *
     * @param  {Hammer.Event} event
     */
    private panEvent(event);
    /**
     * When the user is scrolling
     *
     * @param  {Event} event
     */
    private scrollEvent(event);
    /**
     * Set the startup center calculated on the image (along with the ratio)
     *
     * @param  {Hammer.Event} event
     */
    private setCenter(event);
    /**
     * Calculate the position and set the proper scale to the element and the
     * container
     */
    private displayScale();
    /**
     * Check wether to disable or enable scroll and then call the events
     */
    private checkScroll();
    /**
     * Animates to a certain scale (with ease)
     *
     * @param  {number} scale
     */
    private animateScale(scale);
}
