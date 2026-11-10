/*
 * Squidly embedding compatibility shims for the Castle Light C2 export.
 * Must load BEFORE c2runtime.js.
 *
 * 1. Inside Squidly the game assets are fetched cross-origin (the dev server
 *    sends Access-Control-Allow-Origin), but this old Construct 2 runtime
 *    never sets crossOrigin on the images/audio it creates, so WebGL rejects
 *    the tainted textures ("texImage2D ... cross-origin data"). Setting
 *    crossOrigin="anonymous" before every src assignment fixes that and is
 *    harmless for same-origin loads.
 *
 * 2. Loading a save-game snapshot restarts music, and the C2 audio plugin can
 *    call createMediaElementSource again for a media element that is already
 *    connected, which throws an uncaught InvalidStateError. Returning the
 *    cached source node for the same element/context keeps audio working.
 */
(function () {
    "use strict";

    function patchSrcSetter(proto) {
        const descriptor = Object.getOwnPropertyDescriptor(proto, "src");
        if (!descriptor || !descriptor.set || !descriptor.get) {
            return;
        }
        Object.defineProperty(proto, "src", {
            configurable: true,
            enumerable: descriptor.enumerable,
            get() {
                return descriptor.get.call(this);
            },
            set(value) {
                try {
                    if (!this.crossOrigin) {
                        this.crossOrigin = "anonymous";
                    }
                } catch (_) {
                    // Never block the actual load.
                }
                descriptor.set.call(this, value);
            }
        });
    }

    patchSrcSetter(HTMLImageElement.prototype);
    patchSrcSetter(HTMLMediaElement.prototype);

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass && AudioContextClass.prototype.createMediaElementSource) {
        const original = AudioContextClass.prototype.createMediaElementSource;
        const sourceCache = new WeakMap(); // media element -> MediaElementAudioSourceNode
        AudioContextClass.prototype.createMediaElementSource = function (element) {
            const cached = sourceCache.get(element);
            if (cached && cached.context === this) {
                return cached;
            }
            try {
                const node = original.call(this, element);
                sourceCache.set(element, node);
                return node;
            } catch (error) {
                console.warn("[SquidlyCompat] createMediaElementSource failed; using silent fallback node:", error);
                // The element is connected to a source in another context, so
                // audio cannot be rerouted here. A gain node from THIS context
                // is safe to connect() downstream and keeps the runtime going.
                return this.createGain();
            }
        };
    }
})();
