<?php
/**
 * Frontend assets and render attributes.
 *
 * @package Soleman_Elementor_Animate_Hue
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Element_Base;

/**
 * Handles frontend output and asset loading.
 */
class Soleman_Animate_Hue_Frontend {

	/**
	 * Instance.
	 *
	 * @var Soleman_Animate_Hue_Frontend|null
	 */
	private static $instance = null;

	/**
	 * Whether assets were enqueued.
	 *
	 * @var bool
	 */
	private $assets_enqueued = false;

	/**
	 * Get singleton instance.
	 *
	 * @return Soleman_Animate_Hue_Frontend
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}

		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action( 'elementor/frontend/after_register_styles', array( $this, 'register_styles' ) );
		add_action( 'elementor/frontend/after_register_scripts', array( $this, 'register_scripts' ) );
		add_action( 'elementor/frontend/before_enqueue_styles', array( $this, 'enqueue_assets' ) );
		add_action( 'elementor/frontend/before_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'elementor/preview/enqueue_styles', array( $this, 'enqueue_assets' ) );
		add_action( 'elementor/preview/enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'elementor/element/after_add_attributes', array( $this, 'after_add_attributes' ) );
	}

	/**
	 * Register stylesheet.
	 *
	 * @return void
	 */
	public function register_styles() {
		wp_register_style(
			'soleman-animate-hue',
			SOLEMAN_ANIMATE_HUE_URL . 'assets/css/animate-hue.css',
			array(),
			SOLEMAN_ANIMATE_HUE_VERSION
		);
	}

	/**
	 * Register script.
	 *
	 * @return void
	 */
	public function register_scripts() {
		wp_register_script(
			'soleman-animate-hue',
			SOLEMAN_ANIMATE_HUE_URL . 'assets/js/animate-hue.js',
			array( 'elementor-frontend' ),
			SOLEMAN_ANIMATE_HUE_VERSION,
			true
		);
	}

	/**
	 * Whether debug mode is requested via query string.
	 *
	 * @return bool
	 */
	private function is_debug_requested() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		return isset( $_GET['sm_ah_debug'] ) && '1' === sanitize_text_field( wp_unslash( $_GET['sm_ah_debug'] ) );
	}

	/**
	 * Enqueue CSS and JS once on Elementor frontend / preview.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		if ( $this->assets_enqueued ) {
			return;
		}

		wp_enqueue_style( 'soleman-animate-hue' );
		wp_enqueue_script( 'soleman-animate-hue' );

		wp_localize_script(
			'soleman-animate-hue',
			'solemanAnimateHue',
			array(
				'version' => SOLEMAN_ANIMATE_HUE_VERSION,
				'debug'   => $this->is_debug_requested(),
			)
		);

		$this->assets_enqueued = true;
	}

	/**
	 * Whether Animation Hue is enabled on the element.
	 *
	 * @param Element_Base $element Elementor element.
	 * @return bool
	 */
	private function is_enabled( Element_Base $element ) {
		$settings = $element->get_settings_for_display();

		return ! empty( $settings['sm_animate_hue_enable'] ) && 'yes' === $settings['sm_animate_hue_enable'];
	}

	/**
	 * Add wrapper class when enabled.
	 *
	 * @param Element_Base $element Elementor element.
	 * @return void
	 */
	public function after_add_attributes( Element_Base $element ) {
		if ( 'container' !== $element->get_name() ) {
			return;
		}

		if ( ! $this->is_enabled( $element ) ) {
			return;
		}

		$element->add_render_attribute( '_wrapper', 'class', 'soleman-animate-hue' );
	}
}
