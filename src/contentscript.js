var btc_e_terminator_content = {

    initialize: function () {
        this.extension = chrome.extension;
        this.storage = chrome.storage;

        this.elements = {};
        this.content = null;
        this.storageOptions = {};

        this.isDOMContentLoaded = false;
        this.isOptionReceived = false;
        this.isOptionProcessed = false;

        this.isAuthenticated = false;
    },

    injectStylesheetsAsync: function () {
        var self = this;

        var injectCSS = function () {
            if (document.head) {
                document.removeEventListener('DOMSubtreeModified', injectCSS, false);
                var style = document.createElement('link');
                style.rel = 'stylesheet';
                style.type = 'text/css';
                style.href = self.extension.getURL('contentscript.css');
                (document.head || document.documentElement).appendChild(style);
            }
        };

        document.addEventListener('DOMSubtreeModified', injectCSS, false);
    },

    initElementsAsync: function () {
        var self = this;

        document.addEventListener('DOMContentLoaded', function () {
            self.isDOMContentLoaded = true;

            self.initElements();

            if (self.isOptionReceived && !self.isOptionProcessed) {
                self.processStorageOptions();
            }
        });
    },

    getStorageDataAsync: function () {
        var self = this;

        this.storage.local.get('storageOptions', function (items) {

            self.isOptionReceived = true;

            self.storageOptions = items['storageOptions'];

            if (!self.storageOptions) {
                self.setDefaultOptions();
            }

            if (self.isDOMContentLoaded && !self.isOptionProcessed) {
                self.processStorageOptions();
            }

        });
    },

    initElements: function () {
        this.initBaseElements();
        this.initProfileMenuElement();
        this.initOptionsLinkElement();
        this.initBitcoinWisdomElements();
    },

    initBaseElements: function () {
        var elements = this.elements;

        this.content = document.getElementById("content");
        elements['rightAll'] = this.content.children[1];
        elements['advantages'] = this.content.children[1].children[2];
        elements['tweets'] = this.content.children[1].children[1];
        elements['chat'] = this.content.children[1].children[0];
        elements['gfx'] = document.getElementById("chart_div");
        elements['pairs'] = elements['gfx'].parentNode.children[1];
        elements['news'] = this.content.children[0].children[0];
        elements['footer'] = document.getElementById("footer");
        elements['header'] = document.getElementById("header");
        elements['sellOrders'] = document.getElementById("orders-s-list").parentNode;
        elements['buyOrders'] = document.getElementById("orders-b-list").parentNode;
        elements['selfOrders'] = document.getElementById("orders-self-list").parentNode;
        elements['feeMessage'] = elements['selfOrders'].nextElementSibling;
        elements['tradeHistory'] = document.getElementById("trade_history").parentNode;
        elements['subContent'] = elements['tradeHistory'].parentNode;

        for (var i = elements.length - 1; i >= 0; i--) {
            elements[i].style.display = 'none';
        }
    },

    initProfileMenuElement: function () {
        var profile = document.getElementById("header-profile");
        var menu = document.createElement('div');

        if (!profile.children[0].children[0]) {
            return;
        }

        this.isAuthenticated = true;

        var links = [];
        links[0] = profile.children[0].children[0].children[0].outerHTML;
        links[1] = profile.children[0].children[0].children[2].outerHTML;
        links[2] = profile.children[0].children[0].children[1].outerHTML;
        links[3] = profile.children[0].children[1].outerHTML;
        links[4] = profile.children[0].children[2].outerHTML;
        links[5] = profile.children[0].children[4].outerHTML;

        for (var i = 0; i < links.length; i++) {
            menu.innerHTML += links[i] + (i < (links.length - 1) ? ' | ' : ' ');
        }
        menu.className = "userMenu";

        this.elements['menu'] = menu;
    },

    initOptionsLinkElement: function () {
        var extOptions, extOptionsLink;

        extOptions = document.createElement('div');
        extOptions.className = 'extOptions';
        extOptionsLink = document.createElement('a');
        extOptionsLink.className = 'extOptionsLink';
        extOptionsLink.href = this.extension.getURL("options.html");
        extOptionsLink.target = '_blank';
        extOptionsLink.innerHTML = 'terminator options &nbsp; &nbsp; &nbsp;';
        if(this.isAuthenticated) {
            extOptionsLink.className += " loggedOn";
        }
        extOptions.appendChild(extOptionsLink);

        this.elements['extOptions'] = extOptions;
        this.elements['extOptionsLink'] = extOptionsLink;
    },

    initBitcoinWisdomElement: function (token) {
        var bitcoinWisdomWrapper, bitcoinWisdom;

        bitcoinWisdomWrapper = document.createElement('div');
        bitcoinWisdomWrapper.className = 'bitcoinWisdomWrapper' + ' ' + token.toLowerCase();
        bitcoinWisdom = document.createElement('iframe');
        bitcoinWisdom.width = "850";
        bitcoinWisdom.height = "500";

        bitcoinWisdomWrapper.appendChild(bitcoinWisdom);

        this.elements['bitcoinWisdom' + token + 'Frame'] = bitcoinWisdom;
        this.elements['bitcoinWisdom' + token + 'Wrapper'] = bitcoinWisdomWrapper;
    },

    initBitcoinWisdomElements: function () {
        this.initBitcoinWisdomElement('Down');
        this.initBitcoinWisdomElement('Right');
        this.initBitcoinWisdomElement('RightDown');
    },

    appendBitcoinWisdomElement: function(token) {
        var self = this;
        var options = self.storageOptions;
        var elements = self.elements;
        var content = self.content;
        var pairPath = "";

        if (options['bitcoinWisdom' + token] === true) {
            if (options['bitcoinWisdom' + token + 'Pair']) {
                pairPath = "markets/btce/" + options['bitcoinWisdom' + token + 'Pair'];
            }
            elements['bitcoinWisdom' + token + 'Frame'].src = "https://bitcoinwisdom.com/" + pairPath;
            if (token === 'Down') {
                elements['subContent'].appendChild(elements['bitcoinWisdomDownWrapper']);
            }
            else if (token === 'Right' || token === 'RightDown') {
                content.insertBefore(elements['bitcoinWisdom' + token + 'Wrapper'], content.children[content.children.length - 1]);
                if(options['bitcoinWisdom' + token + 'Width'] === true) {
                    //elements['bitcoinWisdom' + token + 'Wrapper'].className += ' wide';
                    elements['bitcoinWisdom' + token + 'Wrapper'].style.width = options['bitcoinWisdom' + token + 'Width'] + 'px';
                }
            }
        }
    },

    setDefaultOptions: function () {
        var options = ['chat', 'tweets', 'advantages', 'news', 'gfx', 'mainToLeft', 'footer', 'header', 'saveProfile', 'sellOrders', 'buyOrders', 'feeMessage', 'tradeHistory', 'bitcoinWisdomDown', 'bitcoinWisdomRight', 'bitcoinWisdomRightDown', 'bitcoinWisdomRightWidth', 'bitcoinWisdomRightDownWidth'];
        this.storageOptions = {};

        for (var i = options.length - 1; i >= 0; i--) {
            this.storageOptions[options[i]] = true;
        }
        this.storageOptions['bitcoinWisdomDownPair'] = 'btcusd';
        this.storageOptions['bitcoinWisdomRightPair'] = 'ltcusd';
        this.storageOptions['bitcoinWisdomRightDownPair'] = 'ltcbtc';

        this.storage.local.set({
            storageOptions: this.storageOptions
        });

        localStorage['storageOptions'] = JSON.stringify(this.storageOptions);
    },

    processStorageOptions: function () {
        var self = this;
        var options = self.storageOptions;
        var elements = self.elements;
        var content = self.content;
        var tmpEl = false;

        self.isOptionProcessed = true;

        //save auth form of non-authorized user before possible header remove
        if (options['saveProfile'] === true && !self.isAuthenticated) {
            elements['menu'] = document.getElementById("header-profile");
            elements['menu'].className = "userLogin";
            elements['menu'].id = "";
            elements['menu'].children[1].setAttribute('style', "");
        }

        //terminator options
        if(!self.isAuthenticated)
            if(tmpEl = elements['menu'].children[1]) {
                if(tmpEl = tmpEl.children[0])
                    if(tmpEl = tmpEl.children[1]) {
                        tmpEl.appendChild(elements['extOptions']);
                        tmpEl = true;
                    }
        }
        if(tmpEl !== true) {
            elements['menu'].appendChild(elements['extOptions']);
        }

        for (var key in options) {
            if (options.hasOwnProperty(key) && elements.hasOwnProperty(key)) {
                if (options[key] === false) {
                    elements[key].style.display = 'block';
                }
                else {
                    elements[key].parentNode.removeChild(elements[key]);
                }
            }
        }

        if (options['advantages'] === false || options['tweets'] === false || options['chat'] === false) {
            elements['rightAll'].style.display = 'block';
        }

        if (options['saveProfile'] === true) {
            content.insertBefore(elements['menu'], content.children[0]);
        }

        if (options['mainToLeft'] === true) {
            content.style.width = '100%';
        }

        self.appendBitcoinWisdomElement('Down');
        self.appendBitcoinWisdomElement('Right');
        self.appendBitcoinWisdomElement('RightDown');
    },

    run: function () {
        this.initialize();
        this.injectStylesheetsAsync();
        this.initElementsAsync();
        this.getStorageDataAsync();
    }

};

btc_e_terminator_content.run();

