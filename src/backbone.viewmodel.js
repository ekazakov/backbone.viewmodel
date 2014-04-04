define(function(require, exports, module) {
    var Backbone = require("backbone");
    var _        = require("underscore");

    var ModelDecorator = Backbone.Model.extend({
        _applySuper: function (method, args) {
            return Backbone.Model.prototype[method].apply(this, args);
        },

        constructor: function (original, attributes, options) {
            var attrs = _.defaults({}, attributes || {}, _.result(this, "defaults"));

            this._original          = original;
            this._decorator         = new Backbone.Model(attrs, options);
            this._decoratorAttrKeys = _(this._decorator.attributes).keys();

            this._applySuper("constructor");

            this.attributes = {};

            this._decorateAttributes(this._decorator, this.attributes, this._decoratorAttrKeys);
            this._decorateAttributes(this._original, this.attributes, this._originalAttrsKeysInitialFilter());

            this.listenTo(this._original, "change", this._onOriginalChange);
            this.listenTo(this._original, "all", this.trigger);

            Object.defineProperty(this, "cid", {
                enumerable: true,
                get: function () {
                    return this._original.cid;
                }
            });

            Object.defineProperty(this, "id", {
                enumerable: true,
                get: function () {
                    return this._original.id;
                }
            });
        },

        _originalAttrsKeysInitialFilter: function () {
            return _(this._original.attributes)
                .chain()
                .keys()
                .filter(function (key) {
                    return !_(this._decoratorAttrKeys).contains(key);
                }, this)
                .value()
            ;
        },

        _onOriginalChange: function (original, options) {
            if (options._byDecorator) {
                return;
            }

            var keys = this._filterAttrsKeys(_(original.changedAttributes()).keys(), _(this.attributes).keys());

            this._decorateAttributes(this._original, this.attributes, keys);
            this._originalChanged = true;
            this._previousAttributes = _(this.attributes).clone();
        },

        set: function (key) {
            if (key == null) {
                return this;
            }

            var originalAttrsKeys = this._filterAttrsKeys(this._attrsKeys(key), _(this.attributes).keys());

            this._decorateAttributes(this._original, this.attributes, originalAttrsKeys);
            this._originalChanged = false;

            return this._applySuper("set", arguments);
        },

        close: function () {
            this.stopListening();
            this._original = null;
        },

        _attrsKeys: function (key) {
            return typeof key === "object" ? _(key).keys() : [key];
        },

        _decorateAttributes: function (source, target, names) {
            // TODO добавмить оптимизацию:
            // не переопределять уже существующие свойства
            _(names).each(function(name) {
                Object.defineProperty(target, name, {
                    enumerable:   true,
                    configurable: true,

                    get: function () { return source.get(name); },
                    set: function (value) { source.set(name, value, { _byDecorator: true }); }
                });
            });
        },

        _filterAttrsKeys: function (keys, existingKeys) {
            var decoratorAttrKeys = this._decoratorAttrKeys;

            return _(keys).filter(function (key) {
                return !_(decoratorAttrKeys).contains(key) && !_(existingKeys).contains(key);
            });
        },

        hasChanged: function (attr) {
            var original = this._original;

            if (this._originalChanged) {
                return original.hasChanged(attr);
            }

            return this._applySuper("hasChanged", [attr]);
        },

        changedAttributes: function (diff) {
            var original = this._original;

            if (this._originalChanged) {
                return original.changedAttributes(diff);
            }

            return this._applySuper("changedAttributes", [diff]);
        },

        previous: function (attr) {
            var original = this._original;

            if (this._originalChanged && !_(_(this._decorator.attributes).keys()).contains(attr)) {
                return original.previous(attr);
            }

            return this._applySuper("previous", [attr]);
        },

        previousAttributes: function () {
            var original = this._original;

            if (this._originalChanged) {
                return _(this.attributes).extend(original.previousAttributes());
            }
            return this._applySuper("previousAttributes");
        },

        clone: function () {
            return new this.constructor(this._original, this._decorator.attributes);
        },

        validate: function () {
            return this._original.validate.apply(this._original, arguments);
        },

        preValidate: function () {
            return this._original.preValidate.apply(this._original, arguments);
        },

        isValid: function () {
            return this._original.isValid.apply(this._original, arguments);
        },
    });

    module.exports = ModelDecorator;
});
