// ==UserScript==
// @name        Redmine - linked-tasks-autocomplete
// @author      Anton Nizhegorodov
// @version     0.1
// @description Copies and pastes similar fields in linked tasks
// @copyright   2014+, Anton Nizhegorodov
// ==/UserScript==


$(document).ready(function() {
    function Branch(key, parser, storage, container) {
        this.key     = key;
        this.parser  = parser;
        this.storage = storage;
        this.save();
        var self = this;
        $(document).ajaxComplete(function(){
        	self.push(container);
        });
        this.push(container);
    }
        
    Branch.prototype = {
        constructor: Branch,
        remove: function() {
            this.storage.removeItem(this.key);
        },
        save: function() {
            var el = this.element();
            if (el == 404) {
                return false;
            }
            if (!el) {
                this.remove();
                return false;
            }
            var data = this.element().text();
            if (data) {
                this.storage.setItem(this.key, data);
            } else {
                this.remove();
            }
        },
        element: function() {
            return this.parser.find();
        },
        fetch: function() {
        	return this.storage.getItem(this.key);
        },
        push: function(container) {
            if (!this.urlMatches()) {
                return false;
            }
            var data = this.fetch() || false;
            if (data && $(container).length > 0) {
                console.log(1);
                $(container).val(data);
            }
        },
        urlMatches: function () {
            return /new$/.test(document.URL);
        }
    };
    
    function Parser(query, index) {
        this.query = query;
        this.elIndex = index;
    }
    
    Parser.prototype = {
        constructor: Parser,
        find: function() {
            var results = $(this.query);
            if (results.length == 0) {
                return 404;
            }
            if (results.length < this.elIndex) {
                return false;
            }
            var el = results.eq(this.elIndex).next();
            return (el.length == 0 || el.text() == '') ? false : el;
        }
    };
    
    function SubjectParser(query, index) {
        Parser.call(this, query, index);
    }
    
    SubjectParser.prototype = new Parser();
    SubjectParser.prototype.find = function() {
    	var results = $(this.query);
        if (results.length == 0) {
            return 404;
        }
        if (results.length < this.elIndex) {
            return false;
        }
        var el = results.eq(this.elIndex);
        return (el.length == 0 || el.text() == '') ? false : el;
    };
    
    var source_branches_query = 'table.attributes th:contains(Branch)',
        source_subject_query = 'div.subject h3',
		br_parser = new Parser(source_branches_query, 0),
		br_dm_parser = new Parser(source_branches_query, 1),
		br_cr_parser = new Parser(source_branches_query, 2),
        subject_parser = new SubjectParser(source_subject_query, 0),
        br = new Branch('redmine_branch', br_parser, localStorage, 'input.issue_custom_field_values_branch'),
        br_dm = new Branch('redmine_dm_branch', br_dm_parser, localStorage, 'input.issue_custom_field_values_datamodel_branch'),
        br_cr = new Branch('redmine_cr_branch', br_cr_parser, localStorage, 'input.issue_custom_field_values_crontab_branch'),
    	subject = new Branch('redmine_subject', subject_parser, localStorage, 'input#issue_subject');
});

