/**
 * @fixedFloatingNav组件，
 **/

define(["avalon",
    "text!./fixedFloatingNav.html",
    "css!./fixedFloatingNav.css"
], function(avalon, template) {
    var widget = avalon.ui.fixedfloatingnav = function(element, data, vmodels) {
        var options = data.fixedfloatingnavOptions;
        options.template = options.getTemplate(template, options);

        // element本身存在ms-if或者内部包含ms-repeat等绑定，在抽取数据之前，先对element进行扫描
        element.removeAttribute("ms-duplex");
        avalon.scan(element, vmodels);

        // get data
        var items = getDataFromHTML(element);

        //avalon(element).css('display', 'none');

        // 得到页面第一个符合条件的A标签
        function getFirstAnchor(list) {
            for (var i = 0, el; el = list[i++]; ) {
                if (el.nodeName === "A") {
                    return el;
                }
            }
        }

        // document.getElementsByClassName的理想实现
        // http://www.cnblogs.com/rubylouvre/archive/2009/07/24/1529640.html
        var getElementsByClassName = function (searchClass, node, tag) {
            var result = [], i;
            if(document.getElementsByClassName){
                var nodes =  (node || document).getElementsByClassName(searchClass);
                if (!tag || tag === "*") {
                    return nodes;
                }

                for(i = 0 ; i < nodes.length; ++i){
                    if(nodes[i].tagName === tag.toUpperCase()){
                        result.push(node);
                    }
                }
                return result;
            } else {
                node = node || document;
                tag = tag || "*";
                var classes = searchClass.split(" "),
                    elements = (tag === "*" && node.all)? node.all : node.getElementsByTagName(tag),
                    patterns = [],
                    current,
                    match;
                i = classes.length;
                while(--i >= 0){
                    patterns.push(new RegExp("(^|\\s)" + classes[i] + "(\\s|$)"));
                }
                var j = elements.length;
                while(--j >= 0){
                    current = elements[j];
                    match = false;
                    for(var k=0, kl=patterns.length; k<kl; k++){
                        match = patterns[k].test(current.className);
                        if (!match)  break;
                    }
                    if (match) result.push(current);
                }
                return result;
            }
        };

        var vmodel = avalon.define(data.fixedfloatingnavId, function(vm) {
            avalon.mix(vm, options);
            vm.widgetElement = element;
            vm.fixed = false;
            vm.activeIndex = 0;
            vm.$skipArray = ["widgetElement", "template", "navElem", "validAnchorIds", "validAnchorElems"];
            vm.navRelativeTop = 30;
            vm.navElem = null;
            vm.validAnchorIds = [];
            vm.validAnchorElems = [];

            // check scroll event to change nav bar
            var checkScroll = function() {
                // check if nav should fixed to top
                if (!vmodel.navElem) {
                    return;
                }

                // fixed to top
                var rectNav = vmodel.navElem.getBoundingClientRect();
                vmodel.fixed = rectNav.top < -vmodel.offsetY;
                vmodel.navRelativeTop = vmodel.fixed ? 0 : vmodel.offsetY;

                // change current active index
                var i, elem, activeSet = false;
                for (i = 0; i < vmodel.validAnchorElems.length; ++i) {
                    elem = vmodel.validAnchorElems[i];
                    if (elem.getBoundingClientRect().top > vmodel.navBarHeight) {
                        vmodel.activeIndex = i === 0 ? 0 : vmodel.validAnchorIds[i - 1];
                        activeSet = true;
                        break;
                    }
                }

                if (!activeSet) {
                    vmodel.activeIndex = vmodel.validAnchorIds[i - 1];
                }
            };

            // find out valid anchors
            var findValidAnchors = function() {
                vmodel.validAnchorIds.splice(0);
                vmodel.validAnchorElems.splice(0);
                for (var i = 0; i < vmodel.navItems.length; ++i) {
                    var hash = vmodel.navItems[i].location;
                    if (!!hash) {
                        if (hash.indexOf('#') === 0) { // anchor
                            hash = hash.slice(1);
                        } else {
                            continue;
                        }
                        var elem = document.getElementById(hash);
                        if (elem && elem.getBoundingClientRect().height > 0) {
                            vmodel.validAnchorIds.push(i);
                            vmodel.validAnchorElems.push(elem);
                        }
                    }
                }
            };

            // scroll to view
            var scrollToAnchorId = function(hash, el) {
                var navBar = getElementsByClassName("fixed-floating-nav-panel", document, "*")[0];
                el = document.getElementById(hash) || getFirstAnchor(document.getElementsByName(hash));

                if (navBar && el) {
                    if (navBar.offsetTop > el.offsetTop) {
                        el.scrollIntoView();
                    } else {
                        window.scrollTo(0, el.offsetTop - vmodel.navBarHeight);
                    }
                } else {
                    window.scrollTo(0, 0);
                }
            };

            vm.$init = function() {
                var pageHTML = options.template;
                element.style.display = "none";
                element.innerHTML = pageHTML;
                avalon.scan(element, [vmodel].concat(vmodels));
                element.style.display = "block";

                vmodel.navElem = getElementsByClassName("fixed-floating-nav-panel", element)[0];
                if (!vmodel.navElem) {
                    throw new Error("找不到导航条");
                }
                findValidAnchors();

                checkScroll = avalon.bind(window, "scroll", checkScroll);

                if (typeof options.onInit === "function") {
                    options.onInit.call(element, vmodel, options, vmodels);
                }
            };
            vm.$remove = function() {
                element.innerHTML = element.textContent = "";
                avalon.unbind(window, "scroll", checkScroll);
                vmodel.navElem = null;
                vmodel.validAnchorIds.splice(0);
                vmodel.validAnchorElems.splice(0);
            };


            vm.jumpToLocation = function(location) {
                if (!location) {
                    return;
                }

                if (location.indexOf('#') === 0) {
                    scrollToAnchorId(location.slice(1));
                } else if (location.indexOf('http://') === 0 ||
                           location.indexOf('https://') === 0) {
                    window.location.assign(location);
                }
            };

        });
        vmodel.$watch("$all", function() {});
        vmodel.navItems.pushArray(items);

        return vmodel;
    };

    widget.defaults = {
        navItems: [], //@param navItems navigation items
        onInit: avalon.noop, //@optMethod onInit(vmodel, options, vmodels) 完成初始化之后的回调,call as element's method
        panelHeight: 110,
        navBarHeight: 40,
        offsetY: 30, // to the top of panel
        getTemplate: function(tmpl, opts) {
            return tmpl;
        }, //@optMethod getTemplate(tpl, opts, tplName) 定制修改模板接口
        $author: "maogm12@gmail.com"
    };

    // parse nav item from nav tag
    function getDataFromHTML(select) {
        var ret = [];
        var elems = select.children;
        for (var i = 0, el; el = elems[i++]; ) {
            // find the first nav tag, and parse the nav items
            if (el.nodeType === 1 && el.tagName === 'NAV') {
                elems = el.children;
                break;
            }
        }

        for (var i = 0, el; el = elems[i++]; ) {
            // parse all link nodes
            if (el.nodeType === 1 && el.tagName === 'A') {
                ret.push({
                    label: el.text.trim(),
                    location: el.attributes['href'].value
                });
            }
        }
        return ret;
    }
});
