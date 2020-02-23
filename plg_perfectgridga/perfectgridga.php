<?php
/**
 * @copyright   Copyright (C) 2020 Dimitrios Grammatikogiannis. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;

/**
 * Google Analytics Lightweight Plugin.
 *
 * @since  1.0.0
 */
class PlgSystemPerfectgridga extends JPlugin {

  /**
   * Application object.
   *
   * @var    JApplicationCms
   * @since  1.0.0
   */
  protected $app;

  /**
   * After Module List Event
   * Adds the Google Analytics Code in the selected Module position
   *
   * @return   void
   *
   * @since    1.0.0
   */
  public function onAfterModuleList(&$modules) {
    if ($this->app->isAdmin()) {
      return;
    }

    // The plugin parameters
    $anonymizedIp = boolval($this->params->get('anonymized-ip', 1)) === true ? 'true' : 'false';
    $colorDepth = boolval($this->params->get('color-depth', 1)) === true ? 'true' : 'false';
    $characterSet = boolval($this->params->get('character-set', 1)) === true ? 'true' : 'false';
    $screenSize = boolval($this->params->get('screen-size', 1)) === true ? 'true' : 'false';
    $language = boolval($this->params->get('language', 1)) === true ? 'true' : 'false';
    $siteCodeGA = (string) $this->params->get('site-code-ga', 'XX-XXXXXXXXX-X');
    $placement = (string) $this->params->get('module-position', 'debug');
    $onEvent = boolval($this->params->get('onevent', 0));
    $eventName = (string) $this->params->get('eventname', 'DOMContentLoaded');

    if ($siteCodeGA === 'XX-XXXXXXXXX-X') {
      return;
    }

    $scriptContent = "###script-goes-here-###";

    if ($onEvent) { 
      $scriptContent = 'document.addEventListener("' . $eventName . '",function(){' . $scriptContent . '});';
    }

    $addition = new stdClass();

    $addition->id = count($modules) + 1;
    $addition->title = '';
    $addition->module = 'mod_custom';
    $addition->position = $placement;
    $addition->content = '<script data-joomla-reposition="false">' . $scriptContent . '</script>';
    $addition->showtitle = 0;
    $addition->menuid = -1;
    $addition->params = '{"prepare_content":"0","backgroundimage":"","layout":"_:default","moduleclass_sfx":"","cache":"0","cache_time":"900","cachemode":"static","module_tag":"div","bootstrap_size":"0","header_tag":"h3","header_class":"","style":""}';

    array_push($modules, $addition);
  }
}
