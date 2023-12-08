"use strict";
/* global mw, $, OO */
(() => {
    const isModule = (name) =>
        ['loading', 'loaded', 'executing', 'ready'].includes( mw.loader.getState( `ext.gadget.${name}` ) ),
        ns = mw.config.get('wgNamespaceNumber'),
        action = mw.config.get('wgAction'),
        mySkin = mw.config.get('skin'),
        group = mw.config.get('wgUserGroups'),
        lib = [ // 修改这个数组以增删用户小工具
        {name: 'summaryFace', label: '界面显示工具', items: [ // 界面工具
            {key: 'label', label: '标签栏', type: 'Dropdown', skin: 'vector', options: [
                {data: 'none', label: '无'},
                {data: 'anna', label: '标准版', callback: () => {
                mw.loader.load('/index.php?title=User:AnnAngela/js/PersonalLabel.js&action=raw&ctype=text/javascript');
            }},
                {data: 'hoshimi', label: '简化版', callback: () => {
                mw.loader.load('/index.php?title=User:星海子/js/label.js&action=raw&ctype=text/javascript');
            }}],
                help: new OO.ui.HtmlSnippet('在右上角添加「<a href="/category:积压工作" target="_blank">积压工作</a>」等链接。推荐维护人员使用。')
            },
            {key: 'highlight', label: '界面代码高亮', type: 'Dropdown', options: [
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
                mw.loader.load('//cdn.jsdelivr.net/gh/bhsd-harry/LLWiki/otherwiki/gadget-code-prettify.min.css', 'text/css');
            }}], config: {disabled: isModule( 'code-prettify' )},
                help: new OO.ui.HtmlSnippet('请先关闭<a href="/special:参数设置#mw-prefsection-gadgets" target="_blank">参数设置</a>中的「高亮CSS、JS代码」小工具。')
            },
            {key: 'toBottom', label: '前往页底', type: 'Dropdown', options: [
                {data: 'none', label: '无'},
                {data: 'leranjun', label: 'Leranjun版', skin: 'vector', callback: () => {
                mw.loader.load('/index.php?title=User:Leranjun/js/ScrollToBottom.js&action=raw&ctype=text/javascript');
            }},
                {data: 'bhsd', label: 'Bhsd版', callback: () => {
                mw.loader.load('//cdn.jsdelivr.net/gh/bhsd-harry/LLWiki@2.5/otherwiki/gadget-mobile-Backtotop.min.js');
                mw.loader.load('//cdn.jsdelivr.net/gh/bhsd-harry/LLWiki@2.5/otherwiki/gadget-mobile-Backtotop.min.css', 'text/css');
            }}], help: '在界面右侧添加按钮用于前往页面底部。'}
        ]},
        {name: 'summaryEdit', label: '编辑工具', items: [ // 编辑工具
        ]},
        {name: 'summaryBrowse', label: '浏览工具', items: [ // 浏览工具
        ]},
        {name: 'summaryAdmin', label: '维护工具', items: [ // 维护工具
        ]},
        {name: 'summaryTest', label: '测试性工具', items: [ // 测试性工具
        ]}
    ];
    mw.gadgets.json.then(() => {
        lib.forEach(({name, items}) => {
            const settings = mw.gadgets[name];
            items.forEach(({key, skin, options, userGroup = ['*'], config = {}}) => {
                if (skin && skin != mySkin || !userGroup.some(right => group.includes( right )) || config.disabled) {
                    return;
                }
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
