<?php
/**
 * Elementor control registration for Container → Advanced → Animation Hue.
 *
 * @package Soleman_Elementor_Animate_Hue
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

use Elementor\Controls_Manager;
use Elementor\Element_Base;
use Elementor\Repeater;

/**
 * Registers Animation Hue controls.
 */
class Soleman_Animate_Hue_Controls {

	/**
	 * Instance.
	 *
	 * @var Soleman_Animate_Hue_Controls|null
	 */
	private static $instance = null;

	/**
	 * Get singleton instance.
	 *
	 * @return Soleman_Animate_Hue_Controls
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
		add_action(
			'elementor/element/container/section_effects/after_section_end',
			array( $this, 'register_controls' )
		);
	}

	/**
	 * Register Animation Hue section on Container Advanced tab.
	 *
	 * @param Element_Base $element Elementor element.
	 * @return void
	 */
	public function register_controls( Element_Base $element ) {
		$element->start_controls_section(
			'section_soleman_animate_hue',
			array(
				'label' => esc_html__( 'Animation Hue', 'soleman-elementor-animate-hue' ),
				'tab'   => Controls_Manager::TAB_ADVANCED,
			)
		);

		$element->add_control(
			'sm_animate_hue_enable',
			array(
				'label'              => esc_html__( 'Enable', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SWITCHER,
				'label_on'           => esc_html__( 'On', 'soleman-elementor-animate-hue' ),
				'label_off'          => esc_html__( 'Off', 'soleman-elementor-animate-hue' ),
				'return_value'       => 'yes',
				'default'            => '',
				'frontend_available' => true,
				'render_type'        => 'none',
			)
		);

		$repeater = new Repeater();

		$repeater->add_control(
			'sm_animate_hue_color',
			array(
				'label'     => esc_html__( 'Color', 'soleman-elementor-animate-hue' ),
				'type'      => Controls_Manager::COLOR,
				'default'   => '#6ec3f4',
				'alpha'     => true,
			)
		);

		$element->add_control(
			'sm_animate_hue_colors',
			array(
				'label'              => esc_html__( 'Hue Colors', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::REPEATER,
				'fields'             => $repeater->get_controls(),
				'min_items'          => 2,
				'max_items'          => 10,
				'prevent_empty'      => true,
				'title_field'        => '{{{ sm_animate_hue_color }}}',
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
				'default'            => array(
					array(
						'sm_animate_hue_color' => '#6ec3f4',
					),
					array(
						'sm_animate_hue_color' => '#a78bfa',
					),
					array(
						'sm_animate_hue_color' => '#f472b6',
					),
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_speed',
			array(
				'label'              => esc_html__( 'Speed', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SLIDER,
				'default'            => array(
					'size' => 50,
				),
				'range'              => array(
					'px' => array(
						'min'  => 1,
						'max'  => 100,
						'step' => 1,
					),
				),
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_opacity',
			array(
				'label'              => esc_html__( 'Opacity', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SLIDER,
				'default'            => array(
					'size' => 0.55,
				),
				'range'              => array(
					'px' => array(
						'min'  => 0,
						'max'  => 1,
						'step' => 0.01,
					),
				),
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_blend',
			array(
				'label'              => esc_html__( 'Blend Mode', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SELECT,
				'default'            => 'soft-light',
				'options'            => array(
					'normal'      => esc_html__( 'Normal', 'soleman-elementor-animate-hue' ),
					'multiply'    => esc_html__( 'Multiply', 'soleman-elementor-animate-hue' ),
					'screen'      => esc_html__( 'Screen', 'soleman-elementor-animate-hue' ),
					'overlay'     => esc_html__( 'Overlay', 'soleman-elementor-animate-hue' ),
					'darken'      => esc_html__( 'Darken', 'soleman-elementor-animate-hue' ),
					'lighten'     => esc_html__( 'Lighten', 'soleman-elementor-animate-hue' ),
					'color-dodge' => esc_html__( 'Color Dodge', 'soleman-elementor-animate-hue' ),
					'color-burn'  => esc_html__( 'Color Burn', 'soleman-elementor-animate-hue' ),
					'hard-light'  => esc_html__( 'Hard Light', 'soleman-elementor-animate-hue' ),
					'soft-light'  => esc_html__( 'Soft Light', 'soleman-elementor-animate-hue' ),
					'difference'  => esc_html__( 'Difference', 'soleman-elementor-animate-hue' ),
					'exclusion'   => esc_html__( 'Exclusion', 'soleman-elementor-animate-hue' ),
					'hue'         => esc_html__( 'Hue', 'soleman-elementor-animate-hue' ),
					'saturation'  => esc_html__( 'Saturation', 'soleman-elementor-animate-hue' ),
					'color'       => esc_html__( 'Color', 'soleman-elementor-animate-hue' ),
					'luminosity'  => esc_html__( 'Luminosity', 'soleman-elementor-animate-hue' ),
				),
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_advanced_heading',
			array(
				'label'     => esc_html__( 'Advanced', 'soleman-elementor-animate-hue' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_blobs',
			array(
				'label'              => esc_html__( 'Blob Count', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SLIDER,
				'default'            => array(
					'size' => 5,
				),
				'range'              => array(
					'px' => array(
						'min'  => 2,
						'max'  => 12,
						'step' => 1,
					),
				),
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_blur',
			array(
				'label'              => esc_html__( 'Blur / Softness', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SLIDER,
				'size_units'         => array( 'px' ),
				'default'            => array(
					'size' => 60,
					'unit' => 'px',
				),
				'range'              => array(
					'px' => array(
						'min'  => 0,
						'max'  => 200,
						'step' => 1,
					),
				),
				'description'        => esc_html__( 'Controls gradient softness (GPU-friendly). Higher = softer edges.', 'soleman-elementor-animate-hue' ),
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_size',
			array(
				'label'              => esc_html__( 'Blob Size', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SLIDER,
				'default'            => array(
					'size' => 80,
				),
				'range'              => array(
					'px' => array(
						'min'  => 20,
						'max'  => 150,
						'step' => 1,
					),
				),
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_intensity',
			array(
				'label'              => esc_html__( 'Motion Intensity', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SLIDER,
				'default'            => array(
					'size' => 60,
				),
				'range'              => array(
					'px' => array(
						'min'  => 10,
						'max'  => 100,
						'step' => 1,
					),
				),
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_debug_heading',
			array(
				'label'     => esc_html__( 'Debug', 'soleman-elementor-animate-hue' ),
				'type'      => Controls_Manager::HEADING,
				'separator' => 'before',
				'condition' => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->add_control(
			'sm_animate_hue_debug',
			array(
				'label'              => esc_html__( 'Debug Panel', 'soleman-elementor-animate-hue' ),
				'type'               => Controls_Manager::SWITCHER,
				'label_on'           => esc_html__( 'On', 'soleman-elementor-animate-hue' ),
				'label_off'          => esc_html__( 'Off', 'soleman-elementor-animate-hue' ),
				'return_value'       => 'yes',
				'default'            => '',
				'description'        => esc_html__( 'Show a floating debug panel that logs actions and timings. You can also open any page with ?sm_ah_debug=1', 'soleman-elementor-animate-hue' ),
				'frontend_available' => true,
				'render_type'        => 'none',
				'condition'          => array(
					'sm_animate_hue_enable' => 'yes',
				),
			)
		);

		$element->end_controls_section();
	}
}
