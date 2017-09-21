var views = {};

views.SearchPanel = Backbone.View.extend({
    el: '#searchPanel',

    initialize: function(options) {
        this.collection = options.collection;

        _.bindAll(this, 'render');
        _.bindAll(this, 'addPerson');
        _.bindAll(this, 'reset');
        _.bindAll(this, 'search');
    },

    render: function() {

        var element = $(this.el);

        element.empty();

        var resetButton = $('<button type="reset" id="resetButton">Reset</button>').click(this.reset);
        element.append(resetButton);

        var addButton = $('<button type="button" id="addButton">Add</button>)').click(this.addPerson);
        element.append(addButton);

        var searchInputContainer = $("<div />", { id: "searching"});
        element.append(searchInputContainer);

        var searchField = $("<select />", { id: "searchField", required: true });
        searchField.append($("<option />", { value: "firstName", text: "First Name", selected: true}));
        searchField.append($("<option />", { value: "lastName", text: "Last Name"}));
        searchInputContainer.append(searchField);

        searchField.change(this.search);

        var searchInput = $("<input />", { type: "search", id: "searchText", name: "searchText", placeholder: "Search" });
        searchInputContainer.append(searchInput);

        searchInput.on('input', _.debounce(this.search, 2000));
        searchInput.on('search', this.search);

        return this;
    },

    addPerson: function() {
        var firstName = prompt('Please, input first name');
        var lastName = prompt('Please, input last name');

        var exists = this.collection.where({firstName: firstName, lastName: lastName}).length > 0;
        if (exists) {
            alert('Such person already exists');
        } else {
            this.collection.append(new models.Person({firstName: firstName, lastName: lastName}));
        }
    },

    reset: function() {
        $('#searchText').val('');
        this.search();
    },

    search: function() {
        var field = $('#searchField').val();
        var text = $('#searchText').val();

        this.collection.applyFilter(field, text);
    }
});

views.PersonRow = Backbone.View.extend({
    tagName: 'tr',

    initialize: function(options) {
        this.collection = options.collection;

        _.bindAll(this, 'render');
        _.bindAll(this, 'removePerson');

        this.model.bind('change', this.render);
    },

    render: function() {
        $(this.el).empty();

        $(this.el).append($('<td>' + this.model.get('firstName') + '</td>'));
        $(this.el).append($('<td>' + this.model.get('lastName') + '</td>'));
        $(this.el).append($('<td>X</td>'))
            .click(this.removePerson);

        return this;
    },

    removePerson: function() {
        this.collection.remove(this.model.get('id'));
    }
});

views.PeopleTable = Backbone.View.extend({
    collection: null,

    el: '#peopleTableBody',

    initialize: function(options) {
        this.collection = options.collection;

        _.bindAll(this, 'render');

        this.collection.bind('reset', this.render);
        this.collection.bind('add', this.render);
        this.collection.bind('remove', this.render);
        this.collection.bind('filter', this.render);
    },

    render: function() {
        var element = $(this.el);
        element.empty();
        var collection = this.collection;

        this.collection.getFilteredItems().forEach(function(item) {
            var itemView = new views.PersonRow({
                collection: collection,
                model: item
            });

            element.append(itemView.render().el);
        });

        return this;
    }
});