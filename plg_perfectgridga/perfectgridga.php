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

    $addition = new stdClass();

    $addition->id = -1;
    $addition->title = '';
    $addition->module = 'mod_custom';
    $addition->position = $placement;
    $addition->content = '<script>(function(a,b,c){var d=a.history,e=document,f=navigator||{},g=localStorage,h=encodeURIComponent,i=d.pushState,k=function(){return Math.random().toString(36)},l=function(){return g.cid||(g.cid=k()),g.cid},m=function(r){var s=[];for(var t in r)r.hasOwnProperty(t)&&void 0!==r[t]&&s.push(h(t)+"="+h(r[t]));return s.join("&")},n=function(r,s,t,u,v,w,x){var z="https://www.google-analytics.com/collect",A=m({v:"1",ds:"web",aip:c.anonymizeIp?1:void 0,tid:b,cid:l(),t:r||"pageview",sd:c.colorDepth&&screen.colorDepth?screen.colorDepth+"-bits":void 0,dr:e.referrer||void 0,dt:e.title,dl:e.location.origin+e.location.pathname+e.location.search,ul:c.language?(f.language||"").toLowerCase():void 0,de:c.characterSet?e.characterSet:void 0,sr:c.screenSize?(a.screen||{}).width+"x"+(a.screen||{}).height:void 0,vp:c.screenSize&&a.visualViewport?(a.visualViewport||{}).width+"x"+(a.visualViewport||{}).height:void 0,ec:s||void 0,ea:t||void 0,el:u||void 0,ev:v||void 0,exd:w||void 0,exf:"undefined"!=typeof x&&!1==!!x?0:void 0});if(f.sendBeacon)f.sendBeacon(z,A);else{var y=new XMLHttpRequest;y.open("POST",z,!0),y.send(A)}};d.pushState=function(r){return"function"==typeof d.onpushstate&&d.onpushstate({state:r}),setTimeout(n,c.delay||10),i.apply(d,arguments)},n(),a.ma={trackEvent:function o(r,s,t,u){return n("event",r,s,t,u)},trackException:function q(r,s){return n("exception",null,null,null,null,r,s)}}})(window,"' . $siteCodeGA . '",{anonymizeIp:' . $anonymizedIp . ',colorDepth:' . $colorDepth . ',characterSet:' . $characterSet . ',screenSize:' . $screenSize . ',language:' . $language . '});</script>';
    $addition->showtitle = 0;
    $addition->menuid = -1;
    $addition->params = '{"prepare_content":"0","backgroundimage":"","layout":"_:default","moduleclass_sfx":"","cache":"0","cache_time":"900","cachemode":"static","module_tag":"div","bootstrap_size":"0","header_tag":"h3","header_class":"","style":"none"}';

    array_push($modules, $addition);
  }
}
