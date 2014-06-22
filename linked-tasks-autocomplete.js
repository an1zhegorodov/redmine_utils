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
            'items': [
            {
                    'item': function(selector) { return new Item(selector); },
                    'params': ['table.attributes th:contains(Branch) + td :nth(1)'],
                    'action': 'hasValue',
            }],
        },
    };

    function Addon(config) {
        this.config = config;
    }

    Addon.prototype = {
        constructor: Addon,
        run: function() {
            for (var pattern in this.config) {
                var re = new RegExp(pattern);
                if (re.test(document.URL)) {
                    var page = this.config[pattern].page(this.config[pattern].items);
                    page.act();
                }
            }
        }
    };

    function Page(items) {
        this.items = items;
    }
    Page.prototype = {
        constructor: Page,
        act: function() {
            for (var i in this.items) {
                var item = this.items[i].item.apply(this, this.items[i].params);
                item[this.items[i].action]();
            }
        }
    };

    function Item(selector) {
        this.element = $(selector);
    }
    Item.prototype = {
        constructor: Item,
        hasValue: function() {
            return this.element.val() || this.element.text();
        }
    };

    function InjectableItem(selector, injector) {
        Item.call(this, selector);
        this.injector = injector;
    }

    InjectableItem.prototype = {
        constructor: InjectableItem,
        inject: function() {
            console.log('works');
        }
    };

    var addon = new Addon(config);
    addon.run();
    
    var source_branches_query  = 'table.attributes th:contains(Branch)',
        source_subject_query   = 'div.subject h3',
        source_diffs_query     = 'table.attributes th:contains(Diff)',
        source_task_type_query = 'table.attributes th:contains(Task type)';
});

