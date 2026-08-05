<?php
/**
 * Plugin Name:       Soleman Elementor Animate Hue
 * Plugin URI:        https://soleman.tw
 * Description:       Add dynamic mesh hue lighting overlays to Elementor Containers via Advanced → Animation Hue.
 * Version:           1.2.0
 * Requires at least: 6.0
 * Requires PHP:      7.4
 * Author:            Soleman
 * Author URI:        https://soleman.tw
 * Text Domain:       soleman-elementor-animate-hue
 * Domain Path:       /languages
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Elementor tested up to: 3.25.0
 * Elementor requires at least: 3.16.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SOLEMAN_ANIMATE_HUE_VERSION', '1.2.0' );
define( 'SOLEMAN_ANIMATE_HUE_FILE', __FILE__ );
define( 'SOLEMAN_ANIMATE_HUE_PATH', plugin_dir_path( __FILE__ ) );
define( 'SOLEMAN_ANIMATE_HUE_URL', plugin_dir_url( __FILE__ ) );

require_once SOLEMAN_ANIMATE_HUE_PATH . 'includes/class-plugin.php';

add_action( 'plugins_loaded', array( 'Soleman_Animate_Hue_Plugin', 'instance' ) );
