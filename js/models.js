var models = {};

function getJSON(url) {
    return new Promise(function (resolve, reject) {
        var xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4) {
                if (xhttp.status == 200) {
                    resolve(JSON.parse(xhttp.responseText));
                }
                else {
                    reject(xhttp.responseText);
                }
            }
        };

        xhttp.open("GET", url, true);
        xhttp.send();
    });
}

models.Person = Backbone.Model.extend({
});

models.People = Backbone.Collection.extend({
    model: models.Person,
    currentFilter: {},

    initialize: function() {
        var data = JSON.parse(localStorage.getItem('dataBackbone'));
        var _this = this;

        
        if (!data) {
            data = getJSON("http://www.json-generator.com/api/json/get/cgmZpkYnYi?indent=2");

            data
                .then(function (data) {
                    var activeUsers = _.filter(data, function (p) {
                        return p.isActive;
                    });
                    var friends = activeUsers[0].friends;
                    var result = [];
                    for (var i = 0; i < friends.length; i++) {
                        var splitName = friends[i].name.split(' ');
                        _this.add(new models.Person({id: i + 1, firstName: splitName[0], lastName: splitName[1]}));
                    }
                }, function (error) {
                    console.log(err);
                });
        }
        else {
            _.forEach(data, function(p) {
               _this.add(new models.Person(p));
            });
        }

        this.bind('reset', this.save);
        this.bind('add', this.save);
        this.bind('remove', this.save);
    },

    append: function(person) {
        var maxId = this.max(function(p) { return p.get('id'); }).get('id');
        person.set({ id: maxId + 1 });
        this.add(person);
    },

    getFilteredItems: function() {
        if (this.currentFilter.field && this.currentFilter.text) {
            var field = this.currentFilter.field;
            var text = this.currentFilter.text.toLocaleLowerCase();

            return this.filter(function (p) {
                return p.get(field).toLocaleLowerCase().indexOf(text) >= 0
            });
        }
        else {
            return this;
        }
    },

    applyFilter: function(field, text) {
        this.currentFilter = { field: field, text: text };

        this.trigger('filter');
    },

    save: function() {
        localStorage.setItem('dataBackbone', JSON.stringify(this));
    }
});