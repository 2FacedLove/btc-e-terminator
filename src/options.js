var btc_e_terminator_options = {

    options: ['chat', 'tweets', 'advantages', 'news', 'gfx', 'mainToLeft', 'footer', 'header', 'saveProfile', 'sellOrders', 'buyOrders', 'feeMessage', 'tradeHistory', 'bitcoinWisdomDown', 'bitcoinWisdomRight', 'bitcoinWisdomRightDown', 'bitcoinWisdomRightWide', 'bitcoinWisdomRightDownWide'],
    rightBlockOptions: ['chat', 'tweets', 'advantages'],
    currentOrdersOptions: ['sellOrders', 'buyOrders'],
    defaultOptions: {},
    statusHideDelay: 1750,

    initialize: function () {
        for (var i = this.options.length - 1; i >= 0; i--) {
            this.defaultOptions[this.options[i]] = true;
        }
        this.defaultOptions['bitcoinWisdomDownPair'] = 'btcusd';
        this.defaultOptions['bitcoinWisdomRightPair'] = 'ltcusd';
        this.defaultOptions['bitcoinWisdomRightDownPair'] = 'ltcbtc';
    },

    isElementChecked: function (elementId) {
        return document.getElementById(elementId) ? document.getElementById(elementId).checked : undefined;
    },

    setElementChecked: function (elementId, checked) {
        if(document.getElementById(elementId)) {
            document.getElementById(elementId).checked = checked;
        }
    },

    toggleRightAll: function () {
        var toggleAll = this.isElementChecked('toggleRightAll');

        for (var i = this.rightBlockOptions.length - 1; i >= 0; i--) {
            this.setElementChecked(this.rightBlockOptions[i], toggleAll);
        }
    },

    toggleCurrentOrders: function () {
        var currentOrders = this.isElementChecked('currentOrders');

        for (var i = this.currentOrdersOptions.length - 1; i >= 0; i--) {
            this.setElementChecked(this.currentOrdersOptions[i], currentOrders);
        }
    },

    toggleAll: function (boolean) {
        var options = this.options;
        this.setElementChecked('toggleRightAll', boolean);
        this.setElementChecked('currentOrders', boolean);

        for (var i = options.length - 1; i >= 0; i--) {
            this.setElementChecked(options[i], boolean);
        }
    },

    selectAll: function () {
        this.toggleAll(true);
    },

    clearAll: function () {
        this.toggleAll(false);
    },

    showAndHideStatus: function () {
        var statusLine = document.getElementById('statusLine');
        statusLine.style.display = 'block';

        window.setTimeout(function () {
            statusLine.style.display = 'none';
        }, this.statusHideDelay);
    },

    loadGroupedOptions: function () {
        var i;

        var toggleRightAll = true;
        for (i = this.rightBlockOptions.length - 1; i >= 0; i--) {
            toggleRightAll &= this.isElementChecked(this.rightBlockOptions[i]);
        }
        this.setElementChecked('toggleRightAll', toggleRightAll);

        var toggleCurrentOrders = true;
        for (i = this.currentOrdersOptions.length - 1; i >= 0; i--) {
            toggleCurrentOrders &= this.isElementChecked(this.currentOrdersOptions[i]);
        }
        this.setElementChecked('currentOrders', toggleCurrentOrders);
    },

    loadOptions: function () {
        var options = this.options;
        var storageOptions = localStorage['storageOptions'];

        if (!storageOptions) {
            storageOptions = this.defaultOptions;
        }
        else {
            storageOptions = JSON.parse(storageOptions);
        }

        for (var i = options.length - 1; i >= 0; i--) {
            this.setElementChecked(options[i], storageOptions[options[i]]);
        }

        document.getElementById('bitcoinWisdomDownPair').value = storageOptions['bitcoinWisdomDownPair'];
        document.getElementById('bitcoinWisdomRightPair').value = storageOptions['bitcoinWisdomRightPair'];
        document.getElementById('bitcoinWisdomRightDownPair').value = storageOptions['bitcoinWisdomRightDownPair'];

        this.loadGroupedOptions();
    },

    saveOptions: function () {
        var options = this.options;
        var storageOptions = {};

        for (var i = options.length - 1; i >= 0; i--) {
            storageOptions[options[i]] = this.isElementChecked(options[i]);
        }
        storageOptions['bitcoinWisdomDownPair'] = document.getElementById('bitcoinWisdomDownPair').value;
        storageOptions['bitcoinWisdomRightPair'] = document.getElementById('bitcoinWisdomRightPair').value;
        storageOptions['bitcoinWisdomRightDownPair'] = document.getElementById('bitcoinWisdomRightDownPair').value;

        localStorage['storageOptions'] = JSON.stringify(storageOptions);

        chrome.storage.local.set({
            storageOptions: storageOptions
        });

        this.showAndHideStatus();
    },

    addEventListeners: function () {
        var self = this;

        document.querySelector('#toggleRightAll').addEventListener('click', function () {
            self.toggleRightAll.call(self);
        });

        document.querySelector('#currentOrders').addEventListener('click', function () {
            self.toggleCurrentOrders.call(self);
        });

        document.querySelector('#selectAll').addEventListener('click', function () {
            self.selectAll.call(self);
        });
        document.querySelector('#clearAll').addEventListener('click', function () {
            self.clearAll.call(self);
        });

        document.querySelector('#saveOptions').addEventListener('click', function () {
            self.saveOptions.call(self);
        });

        document.addEventListener('DOMContentLoaded', function () {
            self.loadOptions.call(self);
        });
    },

    run: function () {
        this.initialize();
        this.addEventListeners();
    }

};

btc_e_terminator_options.run();