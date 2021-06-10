"use strict";
/* global mw, $ */
(() => {
    const isModule = (name) => ['loading', 'loaded', 'executing', 'ready'].includes( `ext.gadget.${name}` ),
        ns = mw.config.get('wgNamespaceNumber'),
        action = mw.config.get('wgAction'),
        mySkin = mw.config.get('skin'),
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
            }}], config: {disabled: isModule( 'code-prettify' )}},
            {key: 'toBottom', type: 'Dropdown', options: [
                {data: 'none', label: '无'},
                {data: 'leranjun', label: 'Leranjun版', disabled: mySkin != 'vector', callback: () => {
                mw.loader.load('https://zh.moegirl.org.cn/index.php?title=User:Leranjun/js/ScrollToBottom.js&action=raw&ctype=text/javascript');
            }},
                {data: 'bhsd', label: 'Bhsd版', callback: () => {
                if (ns < 0 || !['view', 'submit'].includes( action )) { return; }
                mw.loader.load('https://cdn.jsdelivr.net/gh/bhsd-harry/LLWiki@2.5/otherwiki/gadget-mobile-Backtotop.min.js');
                mw.loader.load('https://cdn.jsdelivr.net/gh/bhsd-harry/LLWiki@2.5/otherwiki/gadget-mobile-Backtotop.min.css', 'text/css');
            }}]}
        ]},
        {name: 'summaryEdit', items: [ // 编辑工具
        ]},
        {name: 'summaryBrowse', items: [ // 浏览工具
        ]},
        {name: 'summaryAdmin', items: [ // 维护工具
        ]},
        {name: 'summaryTest', items: [ // 测试性工具
        ]}
    ];
    mw.gadgets.json.then(() => {
        lib.forEach(({name, items}) => {
            const settings = mw.gadgets[name];
            items.forEach(({key, skin, options, config = {}}) => {
                if (skin && skin != mySkin || config.disabled) { return; }
                options.filter(({data, disabled}) => {
                    const val = settings[key] || [];
                    return (Array.isArray(val) ? val.includes( data ) : val == data) && !disabled;
                }).forEach(({callback = () => {}}) => { callback(); });
            });
        });
        mw.hook( 'settings.dialog' ).add(obj => {
            if (!$.isEmptyObject( obj )) { return; }
            lib.forEach((param) => { mw.settingsDialog.addTab( param ); });
        });
    });
}) ();
