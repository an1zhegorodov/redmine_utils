// ==UserScript==
// @name        Redmine - linked-tasks-autocomplete
// @author      Anton Nizhegorodov
// @version     0.1
// @description Copies and pastes similar fields in linked tasks
// @copyright   2014+, Anton Nizhegorodov
// ==/UserScript==


$(document).ready(function() {
    var config = {
        'issues/\\d+$': {
            'page': function(items) { return new Page(items);},
            'items': [{
                    'item': function(selector) { return new Item(selector); },
                    'params': ['table.attributes th:contains(Branch) + td :nth(1)'],
                    'action': 'hasValue',
            }],
        },
    };

    function Addon(config) {
        this.config = config;

        this.run = function() {
            for (var pattern in this.config) {
                var re = new RegExp(pattern);
                if (re.test(document.URL)) {
                    var page = this.config[pattern].page(this.config[pattern].items);
                    page.act();
                }
            }
        }
    }

    function Page(items) {
        this.items = items;

        this.act = function() {
            for (var i in this.items) {
                var item = this.items[i].item.apply(this, this.items[i].params);
                item[this.items[i].action]();
            }
        }
    }

    function Item(selector) {
        this.element = $(selector);

        this.hasValue = function() {
            return this.element.val() || this.element.text();
        }
    }

    function InjectableItem(selector, name, injector) {
        Item.call(this, selector);
        this.name = name;
        this.injector = injector;

        this.inject = function() {
            
        }
    }

    function Injector() {
        var params;

        this.set = function (key, value) {
          params[key] = value;
          this.push();
        }

        this.remove = function (key, value) {
          delete params[key];
          this.push();
        }

        this.get = function (key, value) {
           return params[key];
        }

        this.keyExists = function (key) {
           return params.hasOwnProperty(key);
        }

        this.push = function () {
           var hashBuilder = [], key, value;

           for(key in params) if (params.hasOwnProperty(key)) {
               key = escape(key), value = escape(params[key]); // escape(undefined) == "undefined"
               hashBuilder.push(key + ( (value !== "undefined") ? '=' + value : "" ));
           }

           window.location.hash = hashBuilder.join("&");
       }

       (this.load = function () {
           params = {}
           var hashStr = window.location.hash, hashArray, keyVal
           hashStr = hashStr.substring(1, hashStr.length);
           hashArray = hashStr.split('&');

           for(var i = 0; i < hashArray.length; i++) {
               keyVal = hashArray[i].split('=');
               params[unescape(keyVal[0])] = (typeof keyVal[1] != "undefined") ? unescape(keyVal[1]) : keyVal[1];
           }
       })();
    }

    var addon = new Addon(config);
    addon.run();
    
    var source_branches_query  = 'table.attributes th:contains(Branch)',
        source_subject_query   = 'div.subject h3',
        source_diffs_query     = 'table.attributes th:contains(Diff)',
        source_task_type_query = 'table.attributes th:contains(Task type)';
});