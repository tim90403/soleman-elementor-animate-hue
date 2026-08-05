( function ( $ ) {
	'use strict';

	const LAYER_CLASS = 'soleman-animate-hue__layer';
	const BLOB_CLASS = 'soleman-animate-hue__blob';
	const DEBUG_ID = 'soleman-ah-debug-panel';

	const Debug = {
		enabled: false,
		entries: [],
		panel: null,
		logEl: null,
		metaEl: null,
		rafId: 0,
		frames: 0,
		lastFpsTs: 0,
		fps: 0,
		startedAt: 0,

		isRequested() {
			try {
				const params = new URLSearchParams( window.location.search );
				if ( params.get( 'sm_ah_debug' ) === '1' ) {
					return true;
				}
			} catch ( e ) {
				/* ignore */
			}

			try {
				if ( window.parent && window.parent !== window ) {
					const parentParams = new URLSearchParams( window.parent.location.search );
					if ( parentParams.get( 'sm_ah_debug' ) === '1' ) {
						return true;
					}
				}
			} catch ( e ) {
				/* cross-origin preview iframe */
			}

			if ( window.solemanAnimateHue && window.solemanAnimateHue.debug ) {
				return true;
			}

			return false;
		},

		enableFromSettings( settings ) {
			if ( settings && settings.sm_animate_hue_debug === 'yes' ) {
				this.enable( 'settings:sm_animate_hue_debug' );
			}
		},

		enable( reason ) {
			if ( this.enabled ) {
				this.log( 'debug', 'Debug already enabled', { reason } );
				return;
			}

			this.enabled = true;
			this.startedAt = performance.now();
			this.ensurePanel();
			this.startFps();
			this.log( 'boot', 'Debug panel enabled', {
				reason: reason || 'unknown',
				href: String( window.location.href ),
				userAgent: navigator.userAgent,
				deviceMemory: navigator.deviceMemory || null,
				hardwareConcurrency: navigator.hardwareConcurrency || null,
				note: 'Animate Hue runs in the browser (CSS/JS). Server impact is limited to outputting Elementor data-settings JSON.',
			} );
		},

		ensurePanel() {
			if ( this.panel ) {
				return;
			}

			const panel = document.createElement( 'div' );
			panel.id = DEBUG_ID;
			panel.className = 'soleman-ah-debug';
			panel.innerHTML =
				'<div class="soleman-ah-debug__header">' +
				'<div><div class="soleman-ah-debug__title">Soleman Animate Hue Debug</div>' +
				'<div class="soleman-ah-debug__meta" data-meta>FPS: — | entries: 0</div></div>' +
				'<button type="button" data-collapse title="Collapse">—</button>' +
				'</div>' +
				'<div class="soleman-ah-debug__actions">' +
				'<button type="button" data-copy>Copy log</button>' +
				'<button type="button" data-export>Export JSON</button>' +
				'<button type="button" data-clear>Clear</button>' +
				'</div>' +
				'<pre class="soleman-ah-debug__log" data-log></pre>';

			document.body.appendChild( panel );

			this.panel = panel;
			this.logEl = panel.querySelector( '[data-log]' );
			this.metaEl = panel.querySelector( '[data-meta]' );

			panel.querySelector( '[data-copy]' ).addEventListener( 'click', () => this.copyText() );
			panel.querySelector( '[data-export]' ).addEventListener( 'click', () => this.copyJson() );
			panel.querySelector( '[data-clear]' ).addEventListener( 'click', () => this.clear() );
			panel.querySelector( '[data-collapse]' ).addEventListener( 'click', () => {
				panel.classList.toggle( 'is-collapsed' );
			} );

			this.makeDraggable( panel, panel.querySelector( '.soleman-ah-debug__header' ) );
		},

		makeDraggable( panel, handle ) {
			let ox = 0;
			let oy = 0;
			let dragging = false;

			handle.addEventListener( 'mousedown', ( e ) => {
				if ( e.target.closest( 'button' ) ) {
					return;
				}
				dragging = true;
				const rect = panel.getBoundingClientRect();
				ox = e.clientX - rect.left;
				oy = e.clientY - rect.top;
				panel.style.right = 'auto';
				panel.style.bottom = 'auto';
				panel.style.left = rect.left + 'px';
				panel.style.top = rect.top + 'px';
				e.preventDefault();
			} );

			window.addEventListener( 'mousemove', ( e ) => {
				if ( ! dragging ) {
					return;
				}
				panel.style.left = e.clientX - ox + 'px';
				panel.style.top = e.clientY - oy + 'px';
			} );

			window.addEventListener( 'mouseup', () => {
				dragging = false;
			} );
		},

		startFps() {
			this.frames = 0;
			this.lastFpsTs = performance.now();

			const tick = ( ts ) => {
				this.frames += 1;
				if ( ts - this.lastFpsTs >= 1000 ) {
					this.fps = this.frames;
					this.frames = 0;
					this.lastFpsTs = ts;
					this.updateMeta();
				}
				this.rafId = window.requestAnimationFrame( tick );
			};

			this.rafId = window.requestAnimationFrame( tick );
		},

		updateMeta() {
			if ( ! this.metaEl ) {
				return;
			}
			this.metaEl.textContent = 'FPS: ' + this.fps + ' | entries: ' + this.entries.length;
		},

		now() {
			return ( performance.now() - ( this.startedAt || 0 ) ).toFixed( 1 ) + 'ms';
		},

		log( type, message, data ) {
			if ( ! this.enabled ) {
				return;
			}

			const entry = {
				t: new Date().toISOString(),
				elapsed: this.now(),
				type: type,
				message: message,
				data: data || null,
				fps: this.fps,
			};

			this.entries.push( entry );
			this.renderEntry( entry );
			this.updateMeta();

			if ( window.console && typeof console.log === 'function' ) {
				console.log( '[Soleman AH]', type, message, data || '' );
			}
		},

		renderEntry( entry ) {
			if ( ! this.logEl ) {
				return;
			}

			const line = document.createElement( 'div' );
			line.className = 'soleman-ah-debug__line';
			if ( entry.type === 'warn' ) {
				line.classList.add( 'soleman-ah-debug__line--warn' );
			} else if ( entry.type === 'error' ) {
				line.classList.add( 'soleman-ah-debug__line--error' );
			} else if ( entry.type === 'perf' ) {
				line.classList.add( 'soleman-ah-debug__line--perf' );
			}

			const payload = entry.data ? '\n' + this.stringify( entry.data ) : '';
			line.innerHTML =
				'<span class="soleman-ah-debug__time">[' +
				this.escape( entry.elapsed ) +
				']</span>' +
				'<strong>' +
				this.escape( entry.type ) +
				'</strong> ' +
				this.escape( entry.message ) +
				this.escape( payload );

			this.logEl.appendChild( line );
			this.logEl.scrollTop = this.logEl.scrollHeight;
		},

		stringify( value ) {
			try {
				return JSON.stringify( value, null, 2 );
			} catch ( e ) {
				return String( value );
			}
		},

		escape( value ) {
			return String( value )
				.replace( /&/g, '&amp;' )
				.replace( /</g, '&lt;' )
				.replace( />/g, '&gt;' );
		},

		getTextDump() {
			return this.entries
				.map( ( entry ) => {
					const payload = entry.data ? '\n' + this.stringify( entry.data ) : '';
					return '[' + entry.t + ' | ' + entry.elapsed + '] (' + entry.type + ') ' + entry.message + payload;
				} )
				.join( '\n\n---\n\n' );
		},

		copyText() {
			this.copy( this.getTextDump(), 'Copied plain-text log' );
		},

		copyJson() {
			this.copy(
				this.stringify( {
					plugin: 'soleman-elementor-animate-hue',
					exportedAt: new Date().toISOString(),
					fpsLatest: this.fps,
					entries: this.entries,
				} ),
				'Copied JSON log'
			);
		},

		copy( text, successMessage ) {
			const done = () => this.log( 'debug', successMessage );

			if ( navigator.clipboard && navigator.clipboard.writeText ) {
				navigator.clipboard.writeText( text ).then( done ).catch( () => {
					this.fallbackCopy( text );
					done();
				} );
				return;
			}

			this.fallbackCopy( text );
			done();
		},

		fallbackCopy( text ) {
			const ta = document.createElement( 'textarea' );
			ta.value = text;
			ta.setAttribute( 'readonly', '' );
			ta.style.position = 'fixed';
			ta.style.left = '-9999px';
			document.body.appendChild( ta );
			ta.select();
			document.execCommand( 'copy' );
			document.body.removeChild( ta );
		},

		clear() {
			this.entries = [];
			if ( this.logEl ) {
				this.logEl.innerHTML = '';
			}
			this.updateMeta();
			this.log( 'debug', 'Log cleared' );
		},

		measure( label, fn, data ) {
			const start = performance.now();
			const result = fn();
			const duration = performance.now() - start;
			this.log( 'perf', label, Object.assign( { durationMs: Number( duration.toFixed( 3 ) ) }, data || {} ) );
			return result;
		},
	};

	function clamp( value, min, max ) {
		return Math.min( max, Math.max( min, value ) );
	}

	function toNumber( value, fallback ) {
		const n = Number( value );
		return Number.isFinite( n ) ? n : fallback;
	}

	function sliderSize( setting, fallback ) {
		if ( setting && typeof setting === 'object' && setting.size !== undefined && setting.size !== '' ) {
			return toNumber( setting.size, fallback );
		}
		return toNumber( setting, fallback );
	}

	function extractColors( settings ) {
		const items = Array.isArray( settings.sm_animate_hue_colors )
			? settings.sm_animate_hue_colors
			: [];

		const colors = items
			.map( ( item ) => ( item && item.sm_animate_hue_color ? String( item.sm_animate_hue_color ).trim() : '' ) )
			.filter( Boolean );

		if ( colors.length >= 2 ) {
			return colors.slice( 0, 10 );
		}

		return [ '#6ec3f4', '#a78bfa', '#f472b6' ];
	}

	function speedToDuration( speed ) {
		const s = clamp( speed, 1, 100 );
		return 28 - ( s / 100 ) * 24;
	}

	function randomBetween( min, max ) {
		return min + Math.random() * ( max - min );
	}

	/**
	 * Evenly distribute blob centers across the container, with light jitter.
	 */
	function placeBlobCenters( count ) {
		const cols = Math.ceil( Math.sqrt( count ) );
		const rows = Math.ceil( count / cols );
		const centers = [];

		for ( let i = 0; i < count; i++ ) {
			const col = i % cols;
			const row = Math.floor( i / cols );
			const left = ( ( col + 0.5 ) / cols ) * 100 + randomBetween( -10, 10 );
			const top = ( ( row + 0.5 ) / rows ) * 100 + randomBetween( -10, 10 );
			centers.push( {
				left: clamp( left, 2, 98 ),
				top: clamp( top, 2, 98 ),
			} );
		}

		return centers;
	}

	/**
	 * Map blur slider to gradient softness instead of CSS filter:blur
	 * (filter animations are the main GPU cost on large containers).
	 */
	function blurToGradientStops( blur ) {
		const soft = clamp( blur, 0, 200 ) / 200;
		return {
			inner: ( 34 - soft * 26 ).toFixed( 1 ) + '%', // 34% → 8%
			outer: ( 58 + soft * 34 ).toFixed( 1 ) + '%', // 58% → 92%
		};
	}

	/**
	 * Build blob styles that cover the full container box.
	 * Width/height use the same % basis so wide containers fill edge-to-edge.
	 */
	function buildBlobStyle( index, colors, size, intensity, duration, blur, center ) {
		const color = colors[ index % colors.length ];
		const travel = clamp( intensity, 10, 100 ) / 100;
		// Map slider 20–150 → roughly 55%–150% of each axis.
		const axis = 40 + ( clamp( size, 20, 150 ) / 150 ) * 110;
		const widthPct = axis * randomBetween( 1.05, 1.35 );
		const heightPct = axis * randomBetween( 1.05, 1.35 );
		const stops = blurToGradientStops( blur );

		return {
			'--sm-ah-color': color,
			'--sm-ah-blob-w': widthPct.toFixed( 2 ) + '%',
			'--sm-ah-blob-h': heightPct.toFixed( 2 ) + '%',
			'--sm-ah-inner-stop': stops.inner,
			'--sm-ah-outer-stop': stops.outer,
			left: center.left.toFixed( 2 ) + '%',
			top: center.top.toFixed( 2 ) + '%',
			'--sm-ah-x1': randomBetween( -10 * travel, 10 * travel ).toFixed( 2 ) + '%',
			'--sm-ah-y1': randomBetween( -10 * travel, 10 * travel ).toFixed( 2 ) + '%',
			'--sm-ah-x2': randomBetween( -32 * travel, 32 * travel ).toFixed( 2 ) + '%',
			'--sm-ah-y2': randomBetween( -32 * travel, 32 * travel ).toFixed( 2 ) + '%',
			'--sm-ah-x3': randomBetween( -32 * travel, 32 * travel ).toFixed( 2 ) + '%',
			'--sm-ah-y3': randomBetween( -32 * travel, 32 * travel ).toFixed( 2 ) + '%',
			'--sm-ah-s1': randomBetween( 0.92, 1.12 ).toFixed( 3 ),
			'--sm-ah-s2': randomBetween( 1.05, 1.32 ).toFixed( 3 ),
			'--sm-ah-s3': randomBetween( 0.95, 1.2 ).toFixed( 3 ),
			'animation-duration': ( duration * randomBetween( 0.8, 1.3 ) ).toFixed( 2 ) + 's',
			'animation-delay': ( -randomBetween( 0, duration ) ).toFixed( 2 ) + 's',
		};
	}

	function applyStyles( el, styles ) {
		Object.keys( styles ).forEach( ( key ) => {
			el.style.setProperty( key, styles[ key ] );
		} );
	}

	function clearLayer( $element ) {
		$element.children( '.' + LAYER_CLASS ).remove();
	}

	function getContainerBox( element ) {
		const rect = element.getBoundingClientRect();
		return {
			w: Math.round( rect.width ),
			h: Math.round( rect.height ),
		};
	}

	function renderLayer( $element, settings ) {
		return Debug.measure(
			'renderLayer',
			() => {
				const element = $element.get( 0 );
				const id = $element.data( 'id' ) || element.getAttribute( 'data-id' ) || 'unknown';

				Debug.enableFromSettings( settings );

				clearLayer( $element );
				Debug.log( 'action', 'Cleared existing overlay layer', { elementId: id } );

				if ( settings.sm_animate_hue_enable !== 'yes' ) {
					$element.removeClass( 'soleman-animate-hue' );
					Debug.log( 'action', 'Effect disabled for container', { elementId: id } );
					return null;
				}

				$element.addClass( 'soleman-animate-hue' );

				const colors = extractColors( settings );
				const speed = sliderSize( settings.sm_animate_hue_speed, 50 );
				const opacity = clamp( sliderSize( settings.sm_animate_hue_opacity, 0.55 ), 0, 1 );
				const blend = settings.sm_animate_hue_blend || 'soft-light';
				const blobs = Math.round( clamp( sliderSize( settings.sm_animate_hue_blobs, 5 ), 2, 12 ) );
				const blur = clamp( sliderSize( settings.sm_animate_hue_blur, 60 ), 0, 200 );
				const size = clamp( sliderSize( settings.sm_animate_hue_size, 80 ), 20, 150 );
				const intensity = clamp( sliderSize( settings.sm_animate_hue_intensity, 60 ), 10, 100 );
				const duration = speedToDuration( speed );
				const box = getContainerBox( element );
				const centers = placeBlobCenters( blobs );
				const stops = blurToGradientStops( blur );

				Debug.log( 'action', 'Building overlay for container', {
					elementId: id,
					box: box,
					colors: colors,
					speed: speed,
					opacity: opacity,
					blend: blend,
					blobs: blobs,
					blur: blur,
					blurMode: 'gradient-softness',
					gradientStops: stops,
					size: size,
					intensity: intensity,
					durationSec: Number( duration.toFixed( 2 ) ),
					centers: centers,
					perfNotes: [
						'No CSS filter:blur / hue-rotate animation (compositor-friendly transform only).',
						'Blur slider maps to gradient softness.',
						'Animations pause when container is off-screen.',
					],
				} );

				const layer = document.createElement( 'div' );
				layer.className = LAYER_CLASS;
				layer.setAttribute( 'aria-hidden', 'true' );
				layer.style.setProperty( '--sm-ah-opacity', String( opacity ) );
				layer.style.setProperty( '--sm-ah-blend', blend );

				const blobSummaries = [];

				for ( let i = 0; i < blobs; i++ ) {
					const blob = document.createElement( 'span' );
					blob.className = BLOB_CLASS;
					const styles = buildBlobStyle( i, colors, size, intensity, duration, blur, centers[ i ] );
					applyStyles( blob, styles );
					layer.appendChild( blob );
					blobSummaries.push( {
						index: i,
						color: styles[ '--sm-ah-color' ],
						left: styles.left,
						top: styles.top,
						w: styles[ '--sm-ah-blob-w' ],
						h: styles[ '--sm-ah-blob-h' ],
					} );
				}

				$element.prepend( layer );

				const layerBox = getContainerBox( layer );
				Debug.log( 'action', 'Overlay attached to container root', {
					elementId: id,
					containerBox: box,
					layerBox: layerBox,
					blobCount: blobs,
					blobs: blobSummaries,
					fillsContainer: layerBox.w >= box.w - 1 && layerBox.h >= box.h - 1,
				} );

				return layer;
			},
			{ elementId: $element.data( 'id' ) || null }
		);
	}

	const AnimateHueHandler = elementorModules.frontend.handlers.Base.extend( {
		onInit() {
			elementorModules.frontend.handlers.Base.prototype.onInit.apply( this, arguments );
			this.visibilityObserver = null;
			Debug.log( 'lifecycle', 'Handler onInit', {
				elementId: this.$element.data( 'id' ) || null,
			} );
			this.run();
		},

		onElementChange( propertyName ) {
			if ( String( propertyName ).indexOf( 'sm_animate_hue_' ) === 0 ) {
				Debug.log( 'lifecycle', 'onElementChange', {
					elementId: this.$element.data( 'id' ) || null,
					propertyName: propertyName,
				} );
				this.run();
			}
		},

		onDestroy() {
			Debug.log( 'lifecycle', 'Handler onDestroy', {
				elementId: this.$element.data( 'id' ) || null,
			} );
			this.teardownVisibilityObserver();
			clearLayer( this.$element );
			elementorModules.frontend.handlers.Base.prototype.onDestroy.apply( this, arguments );
		},

		teardownVisibilityObserver() {
			if ( this.visibilityObserver ) {
				this.visibilityObserver.disconnect();
				this.visibilityObserver = null;
			}
		},

		observeVisibility( layer ) {
			this.teardownVisibilityObserver();

			if ( ! layer || typeof IntersectionObserver === 'undefined' ) {
				return;
			}

			this.visibilityObserver = new IntersectionObserver(
				( entries ) => {
					entries.forEach( ( entry ) => {
						const paused = ! entry.isIntersecting;
						layer.classList.toggle( 'is-paused', paused );
						Debug.log( 'perf', paused ? 'Animations paused (off-screen)' : 'Animations resumed (on-screen)', {
							elementId: this.$element.data( 'id' ) || null,
							ratio: entry.intersectionRatio,
						} );
					} );
				},
				{
					root: null,
					threshold: 0.01,
				}
			);

			this.visibilityObserver.observe( this.$element.get( 0 ) );
		},

		run() {
			const settings = this.getElementSettings() || {};
			Debug.log( 'lifecycle', 'Handler run()', {
				elementId: this.$element.data( 'id' ) || null,
				enable: settings.sm_animate_hue_enable || '',
				debug: settings.sm_animate_hue_debug || '',
			} );
			const layer = renderLayer( this.$element, settings );
			if ( layer ) {
				this.observeVisibility( layer );
			} else {
				this.teardownVisibilityObserver();
			}
		},
	} );

	function shouldAttach( $element ) {
		if ( elementorFrontend.isEditMode() ) {
			return true;
		}

		const settings = $element.data( 'settings' ) || {};
		return settings.sm_animate_hue_enable === 'yes';
	}

	function bindHandler() {
		Debug.log( 'boot', 'Binding frontend/element_ready/container hook' );

		elementorFrontend.hooks.addAction(
			'frontend/element_ready/container',
			( $element ) => {
				const settings = $element.data( 'settings' ) || {};
				const attach = shouldAttach( $element );

				Debug.log( 'lifecycle', 'element_ready/container', {
					elementId: $element.data( 'id' ) || null,
					attach: attach,
					enable: settings.sm_animate_hue_enable || '',
				} );

				if ( ! attach ) {
					return;
				}

				if ( settings.sm_animate_hue_debug === 'yes' ) {
					Debug.enable( 'container-settings' );
				}

				elementorFrontend.elementsHandler.addHandler( AnimateHueHandler, {
					$element: $element,
				} );
			}
		);
	}

	function boot() {
		if ( Debug.isRequested() ) {
			Debug.enable( 'url-or-localized-flag' );
		}

		Debug.log( 'boot', 'Animate Hue frontend boot', {
			hasElementorFrontend: !! window.elementorFrontend,
			isEditMode: !!( window.elementorFrontend && elementorFrontend.isEditMode && elementorFrontend.isEditMode() ),
			config: window.solemanAnimateHue || null,
		} );

		bindHandler();
	}

	window.SolemanAnimateHueDebug = Debug;

	if ( window.elementorFrontend && elementorFrontend.hooks ) {
		boot();
	} else {
		$( window ).on( 'elementor/frontend/init', boot );
	}
}( jQuery ) );
