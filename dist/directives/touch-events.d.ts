import { ElementRef, OnInit, OnDestroy, EventEmitter } from '@angular/core';
export declare class TouchEventsDirective implements OnInit, OnDestroy {
    private el;
    private gestureListener;
    direction: string;
    threshold: number;
    pinch: EventEmitter<{}>;
    pinchstart: EventEmitter<{}>;
    pinchend: EventEmitter<{}>;
    onpan: EventEmitter<{}>;
    panup: EventEmitter<{}>;
    pandown: EventEmitter<{}>;
    panstart: EventEmitter<{}>;
    panend: EventEmitter<{}>;
    pancancel: EventEmitter<{}>;
    doubletap: EventEmitter<{}>;
    constructor(el: ElementRef);
    ngOnInit(): void;
    ngOnDestroy(): void;
}
