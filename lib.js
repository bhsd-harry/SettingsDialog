"use strict";
/* global mw, $ */
(() => {
    const isModule = (name) => ['loading', 'loaded', 'executing', 'ready'].includes( `ext.gadget.${name}` ),
        ns = mw.config.get('wgNamespaceNumber'),
        action = mw.config.get('wgAction'),
        lib = [ // 修改这个数组以增删用户小工具
        {name: 'summaryFace', items: [ // 界面工具
            {key: 'highlight', type: 'Dropdown', options: [
                {data: 'none', label: '无'},
                {data: 'moegirl', label: '标准版', callback: () => {
                if (ns < 0 || !['view', 'submit'].includes( action )) { return; }
                mw.loader.load( 'ext.gadget.code-prettify' );
            }},
                {data: 'dragonFish', label: '机智的小鱼君版', callback: () => {
                if (ns < 0 || !['view', 'submit'].includes( action )) { return; }
                mw.loader.load('/index.php?title=User:机智的小鱼君/gadget/Highlight.js&action=raw&ctype=text/javascript');
                mw.loader.load("/index.php?title=User:机智的小鱼君/gadget/Highlight.css&action=raw&ctype=text/css", 'text/css');
            }},
                {data: 'bhsd', label: 'Bhsd版', callback: () => {
                if (ns < 0 || !['view', 'submit'].includes( action )) { return; }
                mw.loader.load('//cdn.jsdelivr.net/gh/bhsd-harry/LLWiki@2.5/otherwiki/gadget-code-prettify.min.js');
                mw.loader.load('//cdn.jsdelivr.net/gh/bhsd-harry/LLWiki@2.5/otherwiki/gadget-code-prettify.min.css', 'text/css');
            }}], config: {disabled: isModule( 'code-prettify' )}}
        ]},
        {name: 'summaryEdit', items: [ // 编辑工具
        ]},
        {name: 'summaryBrowse', items: [ // 浏览工具
        ]},
        {name: 'summaryAdmin', items: [ // 维护工具
        ]},
        {name: 'summaryTest', items: [ // 测试性工具
        ]}
    ],
        mySkin = mw.config.get('skin');
    mw.gadgets.json.then(() => {
        lib.forEach(({name, items}) => {
            const settings = mw.gadgets[name];
            items.forEach(({key, skin, options}) => {
                if (skin && skin != mySkin) { return; }
                options.filter(({data}) => settings[key].includes( data ))
                    .forEach(({callback = () => {}}) => { callback(); });
            });
        });
        mw.hook( 'settings.dialog' ).add(obj => {
            if (!$.isEmptyObject( obj )) { return; }
            lib.forEach((param) => { mw.settingsDialog.addTab( param ); });
        });
    });
});
