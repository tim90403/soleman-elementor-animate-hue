<?php
/**
 * Main plugin bootstrap.
 *
 * @package Soleman_Elementor_Animate_Hue
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin singleton.
 */
final class Soleman_Animate_Hue_Plugin {

	/**
	 * Instance.
	 *
	 * @var Soleman_Animate_Hue_Plugin|null
	 */
	private static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return Soleman_Animate_Hue_Plugin
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
		add_action( 'elementor/init', array( $this, 'on_elementor_init' ) );
		add_action( 'admin_notices', array( $this, 'admin_notice_missing_elementor' ) );
	}

	/**
	 * Whether Elementor is active.
	 *
	 * @return bool
	 */
	public function is_elementor_active() {
		return did_action( 'elementor/loaded' );
	}

	/**
	 * Boot modules after Elementor is ready.
	 *
	 * @return void
	 */
	public function on_elementor_init() {
		require_once SOLEMAN_ANIMATE_HUE_PATH . 'includes/class-controls.php';
		require_once SOLEMAN_ANIMATE_HUE_PATH . 'includes/class-frontend.php';

		Soleman_Animate_Hue_Controls::instance();
		Soleman_Animate_Hue_Frontend::instance();
	}

	/**
	 * Show admin notice when Elementor is missing.
	 *
	 * @return void
	 */
	public function admin_notice_missing_elementor() {
		if ( $this->is_elementor_active() ) {
			return;
		}

		if ( ! current_user_can( 'activate_plugins' ) ) {
			return;
		}

		echo '<div class="notice notice-warning is-dismissible"><p>';
		echo esc_html__( 'Soleman Elementor Animate Hue requires Elementor to be installed and activated.', 'soleman-elementor-animate-hue' );
		echo '</p></div>';
	}
}
