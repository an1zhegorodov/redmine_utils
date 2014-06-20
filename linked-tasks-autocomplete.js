// ==UserScript==
// @name        Redmine - linked-tasks-autocomplete
// @author      Anton Nizhegorodov
// @version     0.1
// @description Copies and pastes similar fields in linked tasks
// @copyright   2014+, Anton Nizhegorodov
// ==/UserScript==


$(document).ready(function() {
    function Injector(container, injection) {
        this.container = container;
        this.injection = injection;
        this.run();
    }
    Injector.prototype = {
        constructor: Injector,
        run: function() {
            if (this.issue()) {
                $(this.injection).insertAfter(this.container);
            }
        },
        issue: function () {
            return /issues\/\d+$/.test(document.URL);
        }
    };
    function Item(key, parser, storage, container, tracker_container) {
        this.key     = key;
        this.parser  = parser;
        this.storage = storage;
        this.save();
        var self = this;
        $(document).ajaxComplete(function(){
            if ($(tracker_container).val() == '31')
        	self.push(container);
        });
        if ($(tracker_container).val() == '31')
            this.push(container);
    }
        
    Item.prototype = {
        constructor: Item,
        remove: function() {
            this.storage.removeItem(this.key);
        },
        save: function() {
            if (!this.issue()) {
                return false;
            }
            var el = this.parser.find();
            if (!el) {
                this.remove();
                return false;
            }
            var data = el.text();
            if (data) {
                this.storage.setItem(this.key, data);
            } else {
                this.remove();
            }
        },
        fetch: function() {
        	return this.storage.getItem(this.key);
        },
        push: function(container) {
            if (!this.newIssue()) {
                return false;
            }
            var data = this.fetch() || false;
            if (data && $(container).length > 0) {
                $(container).val(data);
            }
        },
        newIssue: function () {
            return /issues\/new#autofill$/.test(document.URL);
        },
        issue: function () {
            return /issues\/\d+$/.test(document.URL);
        }
    };

    function Parser(query, index) {
        this.query = query;
        this.elIndex = index;
    }
    
    Parser.prototype = {
        constructor: Parser,
        noElements: function() {
            return ($(this.query).length == 0) ? true : false;
        },
        prepData: function(el) {
            return el;
        },
        find: function() {
            if (this.noElements()) {
                return false;
            }
            var results = $(this.query);
            if (results.length < this.elIndex) {
                return false;
            }
            var el = this.prepData(results.eq(this.elIndex));
            return (el.length == 0 || el.text() == '') ? false : el;
        }
    };

    function NextParser(query, index) {
        Parser.call(this, query, index);
    }

    NextParser.prototype = new Parser();
    NextParser.prototype.prepData = function(el) {
        return el.next();
    };
    
    function SubjectParser(query, index) {
        Parser.call(this, query, index);
    }
    
    SubjectParser.prototype = new Parser();

    function DiffParser(query, index) {
        Parser.call(this, query, index);
    }

    DiffParser.prototype = new Parser();
    DiffParser.prototype.prepData = function(el) {
        return el.next().children('a').eq(0);
    };

    
    var source_branches_query  = 'table.attributes th:contains(Branch)',
        source_subject_query   = 'div.subject h3',
        source_diffs_query     = 'table.attributes th:contains(Diff)',
        source_task_type_query = 'table.attributes th:contains(Task type)',
        br_parser              = new NextParser(source_branches_query, 0),
        br_dm_parser           = new NextParser(source_branches_query, 1),
        br_cr_parser           = new NextParser(source_branches_query, 2),
        subject_parser         = new SubjectParser(source_subject_query, 0),
        task_type_parser       = new NextParser(source_task_type_query, 0),
        diff_parser            = new DiffParser(source_diffs_query, 0),
        diff_dm_parser         = new DiffParser(source_diffs_query, 1),
        diff_cr_parser         = new DiffParser(source_diffs_query, 2),
        br                     = new Item('redmine_branch', br_parser, localStorage, 'input.issue_custom_field_values_branch', 'select#issue_tracker_id option:selected'),
        br_dm                  = new Item('redmine_dm_branch', br_dm_parser, localStorage, 'input.issue_custom_field_values_datamodel_branch', 'select#issue_tracker_id option:selected'),
        br_cr                  = new Item('redmine_cr_branch', br_cr_parser, localStorage, 'input.issue_custom_field_values_crontab_branch', 'select#issue_tracker_id option:selected'),
    	subject                = new Item('redmine_subject', subject_parser, localStorage, 'input#issue_subject', 'select#issue_tracker_id option:selected'),
    	diff                   = new Item('redmine_diff', diff_parser, localStorage, 'input.issue_custom_field_values_diff_url', 'select#issue_tracker_id option:selected'),
    	diff_dm                = new Item('redmine_dm_diff', diff_dm_parser, localStorage, 'input.issue_custom_field_values_diff_datamodel', 'select#issue_tracker_id option:selected'),
    	diff_cr                = new Item('redmine_cr_diff', diff_cr_parser, localStorage, 'input.issue_custom_field_values_diff_crontab', 'select#issue_tracker_id option:selected'),
        task_type              = new Item('redmine_task_type', task_type_parser, localStorage, 'select.list_cf#issue_custom_field_values_4', 'select#issue_tracker_id option:selected'),
        injector               = new Injector('#main-menu :nth-child(5) a.new-issue', '<a href="/projects/sw/issues/new#autofill" class="new-issue">Новая задача (Hotfix)</a>');
});
