<?php
defined('_JEXEC') or die;

$anonymizedIp = boolval($params->get('anonymized-ip', 1)) === true ? 'true' : 'false';
$colorDepth = boolval($params->get('color-depth', 1)) === true ? 'true' : 'false';
$characterSet = boolval( $params->get('character-set', 1)) === true ? 'true' : 'false';
$screenSize = boolval($params->get('screen-size', 1)) === true ? 'true' : 'false';
$language = boolval($params->get('language', 1)) === true ? 'true' : 'false';
$siteCodeGA = (string) $params->get('site-code-ga', 'XX-XXXXXXXXX-X');
$onEvent = boolval($params->get('onevent', 0));
$eventName = (string) $params->get('eventname', 'DOMContentLoaded');

if ($siteCodeGA === 'XX-XXXXXXXXX-X') {
  return;
}

$scriptContent = "###script-goes-here-###";

if ($onEvent) { 
  $scriptContent = 'document.addEventListener("' . $eventName . '",function(){' . $scriptContent . '});';
}

echo '<script data-joomla-reposition="false">' . $scriptContent . '</script>';
