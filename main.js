"use strict";
/* global mw, $ */
mw.loader.load('//cdn.jsdelivr.net/gh/bhsd-harry/SettingsDialog/gadget-SettingsDialog.min.css', 'text/css');
mw.gadgets = mw.gadgets || {};
mw.loader.using(['mediawiki.api', 'oojs-ui-windows', 'oojs-ui-widgets']).then(() => {
    mw.loader.load('//cdn.jsdelivr.net/gh/bhsd-harry/SettingsDialog/gadget-SettingsDialog.min.js');
    const title = `user:${ mw.config.get('wgUserName') }/gadgets${ mw.config.get('skin') == 'vector' ? '' : '-mobile' }.json`;
    mw.gadgets.json = $.ajax(
        mw.util.getUrl(title, {action: 'raw', ctype: 'application/json'}),
        {dataType: 'json', cache: true}
    ).then(data => data, () => ({})).then(data => {
        mw.gadgets = $.extend(mw.gadgets, data);
        ['summaryFace', 'summaryEdit', 'summaryBrowse', 'summaryAdmin', 'summaryTest'].forEach(key => {
            mw.gadgets[key] = $.extend(mw.gadgets[key], JSON.parse( localStorage.getItem( `gadget-${key}` ) ));
        });
    });
    mw.loader.load('//cdn.jsdelivr.net/gh/bhsd-harry/SettingsDialog/lib.min.js');
});
