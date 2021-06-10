/**
 * @Source: https://llwiki.org/zh/mediawiki:gadget-SettingsDialog.js
 * @Function: 定义用户小工具管理对话框
 * @Methods: getName: 获取类别名称
 *           getObject: 获取类别对象
 *           getPanel: 获取类别标签页
 *           addTab: 添加类别
 *           generateOptions: 生成设置对象
 *           saveOptions: 将设置保存到localStorage
 *           clearOptions: 还原设置
 *           export: 导出设置到JSON页面
 * @Dependencies: mediawiki.api, oojs-ui-windows, oojs-ui-widgets, user
 * @Author: User:Bhsd
 */
"use strict";
/* global mw, $, OO, wgULS */
window.wgULS = window.wgULS ||
    ((hans, hant) => ['zh-hant', 'zh-tw', 'zh-hk', 'zh-mo'].includes( mw.config.get('wgUserLanguage') ) ? hant : hans);
// 1. 监视移动版菜单
(() => {
    const skin = mw.config.get('skin');
    if (skin == 'vector') { return; }
    const detectMenu = ([record]) => {
        const $node = $( record.addedNodes[0] );
        if (!$node.hasClass( 'menu' )) { return; }
        mw.hook( 'mobile.menu' ).fire( $node );
        observer.disconnect();
    },
        observer = new MutationObserver( detectMenu ),
        $node = $('.menu');
    if ($node.length) { mw.hook( 'mobile.menu' ).fire( $node ); }
    else { observer.observe( document.getElementById( 'mw-mf-page-left' ), {childList: true}); }
}) ();
// 2. 设置繁简文字信息
mw.messages.set( $.extend( wgULS({
    'gadget-sd-help': '您可以在这里选用$1的用户小工具，设置仅对当前浏览器有效。如果想要修改设置对所有浏览器生效，请查阅',
    'gadget-sd-minerva': '移动版', 'gadget-sd-helptext': '帮助页面', 'gadget-sd-exporthelp': '导出设置',
    'gadget-sd-success': '设置成功导出至', 'gadget-sd-json': 'JSON页面', 'gadget-sd-failure': '导出设置失败！错误原因：$1',
    'gadget-sd-export': '导出', 'gadget-sd-back': '还原', 'gadget-sd-title': '用户小工具管理', 'gadget-sd-save': '保存',
    'gadget-sd-notify': '您的设置已保存至浏览器！新设置将于刷新页面后生效。',
}, {
    'gadget-sd-help': '您可以在這裡選用$1的使用者小工具，設定僅對當前瀏覽器有效。如果想要修改設定對所有瀏覽器生效，請查閱',
    'gadget-sd-minerva': '移動版', 'gadget-sd-helptext': '說明頁面', 'gadget-sd-exporthelp': '導出設定',
    'gadget-sd-success': '設定成功導出至', 'gadget-sd-json': 'JSON頁面', 'gadget-sd-failure': '導出設定失敗！錯誤原因：$1',
    'gadget-sd-export': '導出', 'gadget-sd-back': '復原', 'gadget-sd-title': '使用者小工具管理', 'gadget-sd-save': '儲存', 
    'gadget-sd-notify': '您的設定已儲存至瀏覽器！新設定將於重新載入頁面後生效。',
}), {'gadget-sd-vector': '桌面版'}) );
(() => {
    // 3. 准备HTML元素
    var ready = false, dialog; // 是否是第一次打开对话框
    const mySkin = mw.config.get('skin'),
        user = mw.config.get('wgUserName'),
        msg = (key) => mw.msg( `gadget-sd-${key}` ),
        $help = $('<div>', {html: [
        mw.msg('gadget-sd-help', msg( mySkin )),
        $('<a>', {href: '/user:星海子/Gadget', target: '_blank', text: mw.msg('gadget-sd-helptext')}),
        '，或',
        $('<a>', {href: '#settingsDialog-btns', text: mw.msg('gadget-sd-exporthelp')}), '。' // 链接跳转到“导出”按钮
    ]}),
        $code = $('<div>', {id: 'settingsDialog-code'}),
        title = `user:${user}/gadgets${mySkin == 'vector' ? '' : '-mobile'}.json`,
        $success = $('<div>', {html: [
        mw.msg( 'gadget-sd-success' ),
        $('<a>', {text: mw.msg( 'gadget-sd-json' ), href: mw.util.getUrl( title ), target: '_blank'}),
        '！'
    ]}),
        $failure = $('<span>').css('color', '#d33'),
        btnExport = new OO.ui.ButtonWidget({label: mw.msg('gadget-sd-export'), flags: 'progressive'})
        .on('click', () => {
        btnExport.setDisabled( true );
        dialog.$overlay.addClass( 'mw-ajax-loader' );
        $code.empty();
        dialog.export().then(() => { $code.append( $success ); },
            err => { $failure.text( mw.msg('gadget-sd-failure', err) ).appendTo( $code );
        }).then(() => {
            btnExport.setDisabled( false );
            dialog.$overlay.removeClass( 'mw-ajax-loader' );
            $code[0].scrollIntoView( {behavior: 'smooth'} );
        });
    }),
        $btns = $('<div>', {id: 'settingsDialog-btns', html: [
        new OO.ui.ButtonWidget({label: mw.msg('gadget-sd-back'), flags: 'destructive'})
            .on('click', () => { dialog.clearOptions(); }).$element,
        btnExport.$element, $code
    ]}),
        // 4. 准备私有工具函数
        deleteKeys = (arr, obj) => { arr.forEach(ele => { delete obj[ele]; }); },
        buildWidget = (obj) => { // 生成单个OOUI widget
        obj.widget = new OO.ui[ `${obj.type}InputWidget` ]( $.extend(
            {
                disabled: obj.skin && obj.skin != mySkin || (obj.config || {}).disabled,
                options: obj.options.filter(({disabled, skin = mySkin}) => skin == mySkin && !disabled),
                value: obj.value
            },
            obj.config
        ) );
        const layout = new OO.ui.FieldLayout(obj.widget, {label: msg( obj.key ), help: obj.help});
        deleteKeys(['config', 'label', 'help', 'value'], obj);
        return layout;
    },
        clearWidgets = (settings = {}, arr = []) => { // 还原一组OOUI widget
        arr.forEach(({key, widget}) => { widget.setValue( settings[key] || '' ); });
    },
        getValues = (arr = []) => Object.fromEntries( // 获取一组OOUI widget的值
        arr.map(({key, widget}) => [key, !widget.isDisabled() && widget.getValue()]).filter(ele => ele[1])
    ),
        buildForm = (params, $element) => {
        if (!params.ready) { // 生成表单，只需要执行一次，不用写成SettingsDialog的内置方法
            const settings = mw.gadgets[ params.name ] || {};
            $element.append([
                ...(params.items || []).map(ele => buildWidget( $.extend(ele, {value: settings[ ele.key ]}) ).$element),
                ...(params.fields || []).map(ele => {
                    const field = new OO.ui.FieldsetLayout({ label: msg( ele.key ), help: ele.help,
                        helpInline: true, items: (ele.items || []).map(item =>
                            buildWidget( $.extend({value: (settings[ ele.key ] || {})[ item.key ]}, item) )
                    )});
                    deleteKeys(['label', 'help'], ele);
                    return field.$element;
                })
            ]);
            params.ready = true;
            mw.hook( 'settings.dialog' ).fire( params ); // 生成一个Hook
        }
        // 切换标签时添加帮助和按钮，不用写成SettingsDialog的内置方法
        $element.prepend( $help ).append( $btns );
        $code.empty();
    },
        openDialog = (e) => {
        e.preventDefault();
        dialog.open().opening.then(() => { buildForm(dialog.getObject(), dialog.getPanel().$element); });
    };
    // 5. 定义SettingsDialog类
    function SettingsDialog() { // constructor只添加一个id，剩下的交给addTab方法逐一添加小工具
        SettingsDialog.super.call(this, {id: 'settingsDialog'});
        this.gadgets = [];
    }
    OO.inheritClass(SettingsDialog, OO.ui.ProcessDialog);
    SettingsDialog.prototype.initialize = function() { // 只创建一个OO.ui.IndexLayout对象，剩下的交给addTab方法填入内容
        SettingsDialog.super.prototype.initialize.apply(this, arguments);
        this.content = new OO.ui.IndexLayout();
        this.$body.append( this.content.$element );
    };
    SettingsDialog.prototype.getActionProcess = function(action) {
        const gadgets = this.gadgets.filter(({ready}) => ready); // 忽略未加载的小工具
        if (action == 'save') { gadgets.forEach(ele => { this.saveOptions( ele ); }); }
        else { gadgets.forEach(ele => { this.clearOptions( ele ); }); }
        this.close();
        return new OO.ui.Process();
    };
    /**
     * @Description: 同时添加数据和HTML，其中HTML会延后
     * @Param {Object} 数据对象
     */
    SettingsDialog.prototype.addTab = function(params) {
        const panel = new OO.ui.TabPanelLayout( params.name, {label: msg( params.name )} );
        delete params.label;
        this.content.addTabPanels( [panel] );
        this.gadgets.push( params );
        // 必要时才开始加载表单
        panel.on('active', () => { buildForm(params, panel.$element); });
        if (ready) { return; }
        // 添加按钮，注意手机版的执行时机
        if (mySkin == 'minerva') {
            mw.hook( 'mobile.menu' ).add(function($menu) {
                console.log('Hook: mobile.menu, 开始添加小工具设置按钮');
                $('<a>', {
                    class: 'mw-ui-icon mw-ui-icon-before mw-ui-icon-minerva-settings',
                    text: mw.msg( 'gadget-sd-title' )
                }).css('color', '#54595d').wrap( '<li>' ).parent().click( openDialog )
                    .appendTo( $menu.find('ul:not(.hlist)').last() );
            });
        }
        else { $( mw.util.addPortletLink('p-cactions', '#', mw.msg('gadget-sd-title')) ).click( openDialog ); }
        ready = true;
    };
    /**
     * @Description: 获取小工具名称
     * @Param {Object} 小工具数据（可选），默认为当前小工具
     * @Return {String} 小工具名称
     */
    SettingsDialog.prototype.getName = function(arg) {
        return arg ? arg.name || arg : this.content.getCurrentTabPanelName();
    };
    /**
     * @Description: 获取小工具数据
     * @Param {String} 小工具名称（可选），默认为当前小工具
     * @Return {Object} 小工具数据
     */
    SettingsDialog.prototype.getObject = function(arg) {
        if (typeof arg == 'object') { return arg; }
        const name = arg || this.getName();
        return this.gadgets.find(({name: n}) => n == name);
    };
    /**
     * @Description: 获取小工具标签页
     * @Param {String} 小工具名称（可选），默认为当前小工具
     * @Param {Object} 小工具数据（可选），默认为当前小工具
     * @Return {OO.ui.TabPanelLayout} 小工具标签页
     */
    SettingsDialog.prototype.getPanel = function(arg) {
        return arg ? this.content.getTabPanel( arg.name || arg ) : this.content.getCurrentTabPanel();
    };
    /**
     * @Description: 生成设置对象
     * @Param {String} 小工具名称（可选），默认为当前小工具
     * @Param {Object} 小工具数据（可选），默认为当前小工具
     * @Param {Boolean} 是否用于导出
     * @Return {Object} 小工具設置
     */
    SettingsDialog.prototype.generateOptions = function(arg, flag) {
        const gadget = this.getObject(arg);
        return $.extend( getValues( gadget.items ), Object.fromEntries( (gadget.fields || []).map(({items, key}) => {
            const obj = getValues( items );
            return [key, flag && $.isEmptyObject( obj ) ? undefined : obj];
        }) ) );
    };
    /**
     * @Description: 保存设置
     * @Param {String} 小工具名称（可选），默认为当前小工具
     * @Param {Object} 小工具数据（可选），默认为当前小工具
     */
    SettingsDialog.prototype.saveOptions = function(arg) {
        const name = this.getName(arg),
            settings = this.generateOptions( name );
        mw.gadgets[ name ] = settings;
        localStorage.setItem(`gadget-${name}`, JSON.stringify( settings ));
        mw.notify(mw.msg( 'gadget-sd-notify' ), {type: 'success', tag: 'gadget-settings'});
    };
    /**
     * @Description: 还原选项
     * @Param {String} 小工具名称（可选），默认为当前小工具
     * @Param {Object} 小工具数据（可选），默认为当前小工具
     */
    SettingsDialog.prototype.clearOptions = function(arg) {
        const gadget = this.getObject(arg),
            settings = mw.gadgets[ gadget.name ];
        clearWidgets(settings, gadget.items);
        (gadget.fields || []).forEach(({key, items}) => { clearWidgets(settings[ key ], items); });
    };
    /**
     * @Description: 导出JSON格式的设置
     * @Param {String} 小工具名称（可选），默认为当前小工具
     * @Return {Promise} Api写入请求
     */
    SettingsDialog.prototype.export = function() {
        const settings = Object.fromEntries(
            this.gadgets.map(ele => [ele.name, ele.ready ? this.generateOptions(ele, true) : mw.gadgets[ ele.name ]])
        );
        return new mw.Api().postWithToken('csrf', {action: 'edit', title, formatversion: 2, summary: '更新小工具设置',
            text: JSON.stringify( settings ), tags: 'Automation tool'
        });
    };
    SettingsDialog.static = {name: 'settingsDialog', tagName: 'div', title: mw.msg('gadget-sd-title'), escapable: true,
        actions: [{action: 'save', label: mw.msg('gadget-sd-save'), flags: ['primary', 'progressive']},
            {action: 'cancel', label: mw.msg('ooui-dialog-message-reject'), flags: 'safe'}]
    };
    // 6. 生成SettingsDialog并保存为全局对象
    dialog = new SettingsDialog();
    const manager = new OO.ui.WindowManager();
    manager.$element.appendTo( document.body );
    manager.addWindows( [dialog] ); // 此时已经初始化
    mw.settingsDialog = dialog; // 创造一个全局对象
    mw.hook( 'settings.dialog' ).fire({});
}) ();
