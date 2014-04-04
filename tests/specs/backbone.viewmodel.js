define(function(require) {
    var ModelDecorator = require("backbone.viewmodel");
    var Backbone       = require("backbone");

    describe("ModelDecorator", function () {
        describe("constructor ", function () {
            it("should create new model decorator with ref to original model", function () {
                var model = new Backbone.Model();
                var md    = new ModelDecorator(model);

                expect(md._original).to.be.equal(model);
            });

            it("should create model decorator with extra attrs", function () {
                var model = new Backbone.Model();
                var md    = new ModelDecorator(model, { x: 1, y: 2 });

                md.has("x").should.to.be.true;
                md.has("y").should.to.be.true;
            });
        });

        describe("set", function () {
            var m, md;

            beforeEach(function () {
                m  = new Backbone.Model({ x: 1, y: 2 });
                md = new ModelDecorator(m);
            });

            it("should set original attrs", function () {
                md.set("x", 2);
                md.set({ y: 3 });
                m.get("x").should.to.be.equal(2);
                m.get("y").should.to.be.equal(3);

                md.set({ x: 4, y: 5 });
                m.get("x").should.to.be.equal(4);
                m.get("y").should.to.be.equal(5);
            });

            it("should set own attrs", function () {
                md = new ModelDecorator(m, { z: 1, f: 2 });
                md.set("z", 2);
                md.set({ f: 3 });

                md.get("z").should.to.be.equal(2);
                md.get("f").should.to.be.equal(3);
                expect(m.get("z")).to.be.undefined;
                expect(m.get("f")).to.be.undefined;
            });

            it("should set own and original attrs", function () {
                md = new ModelDecorator(m, { z: 1, f: 2 });
                md.set({ x: 2, y: 3, z: 4, f: 5, });

                expect(md.get("x")).to.be.equal(2);
                expect(md.get("y")).to.be.equal(3);
                expect(md.get("z")).to.be.equal(4);
                expect(md.get("f")).to.be.equal(5);

                expect(m.get("z")).to.be.undefined;
                expect(m.get("f")).to.be.undefined;
                expect(m.get("x")).to.be.equal(2);
                expect(m.get("y")).to.be.equal(3);
            });

            it.skip("original attrs should (not?) supersede own", function () {
                md.set({ z: 4, f: 5  });
                m.set("z", 5);
                md.set("z", 6);

                m.get("z").should.to.be.equal(6);
            });

            it.skip("recursive set");

            it("should return model decorator", function () {
                md.set("x",3).should.to.be.equal(md);
                md.set("z",3).should.to.be.equal(md);
            });

            it("f1", function () {
                md = new ModelDecorator(m, { a: 1, b: 2 });
                m.set({ x: 2, y: 3, a: 2, b: 2 });

                expect(md.get("a")).to.be.equal(1);
                expect(md.get("b")).to.be.equal(2);

                m.set("g", 1);
                expect(md.get("g")).to.be.equal(1);

                m = new Backbone.Model({ a: 3, b: 2 });
                md = new ModelDecorator(m, { a: 1, b: 1 });

                expect(md.get("b")).to.be.equal(1);
                expect(md.get("a")).to.be.equal(1);
            });
        });

        describe("unset", function () {
            it.skip("should attribute from the model");
        });

        describe("get", function () {
            var m, md;

            beforeEach(function () {
                m  = new Backbone.Model();
                md = new ModelDecorator(m);
            });

            it("should return own attr", function () {
                m.set("x", 1);
                md.set({ y: 3 });
                expect(md.get("y")).to.be.equal(3);
            });

            it("should return model attr", function () {
                m.set("x", 1);
                expect(md.get("x")).to.be.equal(1);
            });
        });

        describe("toJSON", function () {
            it("should return own and original attrs", function () {
                var m  = new Backbone.Model({ x: 1, y: 2 });
                var md = new ModelDecorator(m, { z: 3, f: 4 });

                md.toJSON().should.to.be.eql({ x: 1, y: 2, z: 3, f: 4 });
            });
        });

        describe("hasChanged", function () {
            var m, md;

            beforeEach(function () {
                m  = new Backbone.Model({ x: 1, y: 2 });
                md = new ModelDecorator(m, { z: 3, f: 4 });
            });

            it("should return true if any attr has changed", function () {
                md.set("z", 4);
                md.hasChanged().should.to.be.true;
                md.set("z", 4);

                m.set("x", 2);
                md.hasChanged().should.to.be.true;
            });

            it("should return false if no attr has changed", function () {
                md.hasChanged().should.to.be.false;
            });

            it("should return true if attr has changed", function () {
                md.set("z", 4).hasChanged("z").should.to.be.true;

                m.set("x", 4);
                md.hasChanged("x").should.to.be.true;
            });

            it("f1", function () {
                m.set("x", 2);
                md.set("z", 4);
                md.hasChanged("x").should.to.be.false;
                md.hasChanged("z").should.to.be.true;
            });

            it("f2", function () {
                md.set("z", 4);
                m.set("x", 2);
                md.hasChanged("z").should.to.be.false;
                md.hasChanged("x").should.to.be.true;
            });

            it("should return true if original attr has changed", function () {
                m.set("a", 1);
                md.hasChanged().should.to.be.true;
                md.hasChanged("a").should.to.be.true;
            });

            it("should return false if attr set twice with the same value", function () {
                md.set("z", 4).set("z", 4);
                md.hasChanged().should.to.be.false;
                md.hasChanged("z").should.to.be.false;

                m.set("x", 2).set("x", 2);
                md.hasChanged().should.to.be.false;
                md.hasChanged("x").should.to.be.false;

                m.set("a", 1);
                md.set("a", 1);
                md.hasChanged().should.to.be.false;
                md.hasChanged("a").should.to.be.false;

                m.set("b", 1);
                md.set("b", 1);
                md.hasChanged().should.to.be.false;
                md.hasChanged("b").should.to.be.false;
            });
        });

        describe("changedAttributes", function () {
            var m, md;

            beforeEach(function () {
                m  = new Backbone.Model({ x: 1, y: 2 });
                md = new ModelDecorator(m, { z: 3, f: 4 });
            });

            it("should return changed attrs or false if nothing has changed", function () {
                md.set({ x: 2, z: 4 });
                md.changedAttributes().should.to.be.eql({ x: 2, z: 4 });
            });

            it("f1", function () {
                md.changedAttributes().should.to.be.false;

                m.set("x", 1);
                md.changedAttributes().should.to.be.false;

                m.set("x", 2);
                md.changedAttributes().should.to.be.eql({ x: 2 });

                md.set("z", 3);
                md.changedAttributes().should.to.be.false;
            });

            it("f2", function () {
                m.set("x", 2);
                md.set("z", 4);
                md.changedAttributes().should.to.be.eql({ z: 4 });
            });

            it("f3", function () {
                m.set("x", 2);
                md.set("z", 3);
                md.changedAttributes().should.to.be.false;
            });

            it("f4", function () {
                m.set("x", 2);
                md.set("x", 3);
                md.changedAttributes().should.to.be.eql({ x: 3 });
            });

            it("f5", function () {
                md.set("x", 2);
                m.set("x", 3);
                md.changedAttributes().should.to.be.eql({ x: 3 });
            });

            it("should return possible diff of changed attrs or false", function () {
                md.changedAttributes({}).should.to.be.false;
                md.changedAttributes({ x: 3, z: 4 }).should.to.be.eql({ x: 3, z: 4 });

                md.changedAttributes({ x: 1 }).should.to.be.false;
                md.changedAttributes({ z: 3 }).should.to.be.false;

                md.changedAttributes({ d: 3 }).should.to.be.eql({ d: 3 });

                m.set("f", 5);
                md.changedAttributes({ f: 3 }).should.to.be.eql({ f: 3 });
                md.changedAttributes({ f: 5 }).should.to.be.false;
            });
        });

        describe("clear", function () {
            it.skip("should clear all attributes on the model");
        });

        describe("previousAttributes", function () {
            var m, md;

            beforeEach(function () {
                m  = new Backbone.Model({ x: 1, y: 2 });
                md = new ModelDecorator(m, { z: 3, f: 4 });
            });

            it("should return previous attrs", function () {
                md.previousAttributes().should.to.be.eql({});

                md.set({ x: 2 });
                md.previousAttributes().should.to.be.eql({ x: 1, y: 2, z: 3, f: 4 });

                md.set({ z: 4 });
                md.previousAttributes().should.to.be.eql({ x: 2, y: 2, z: 3, f: 4 });
            });

            it("f1", function () {
                m.set({ x: 1 });
                md.previousAttributes().should.to.be.eql({});

                m.set({ x: 2 });
                md.previousAttributes().should.to.be.eql({ x: 1, y: 2, z: 3, f: 4 });
            });
        });

        describe("previous", function () {
            var m, md;

            beforeEach(function () {
                m  = new Backbone.Model({ x: 1, y: 2 });
                md = new ModelDecorator(m, { z: 3, f: 4 });
            });

            it("should return previous attr", function () {
                expect(md.previous("x")).to.be.undefined;

                m.set("x", 2);
                expect(md.previous("x")).to.be.equal(1);
                expect(md.previous("y")).to.be.equal(2);
                expect(md.previous("z")).to.be.equal(3);

                m.set("x", 2);
                expect(md.previous("x")).to.be.equal(2);
                expect(md.previous("y")).to.be.equal(2);
                expect(md.previous("z")).to.be.equal(3);

                m.set("x", 3);
                expect(md.previous("x")).to.be.equal(2);
                expect(md.previous("y")).to.be.equal(2);
                expect(md.previous("z")).to.be.equal(3);
            });
        });

        describe("clone", function () {
            it("should return new model with same original", function () {
                var m  = new Backbone.Model({ x: 1, y: 2 });
                var md = new ModelDecorator(m, { z: 3 });
                var c  = md.clone();

                md._original.should.to.be.equal(c._original);
                md.toJSON().should.to.be.eql(c.toJSON());
            });
        });

        describe("isValid", function () {
            it.skip("should return true if original is valid");
        });

        describe("close", function () {
            var m, md;

            beforeEach(function () {
                m  = new Backbone.Model({ x: 1, y: 2 });
                md = new ModelDecorator(m);
            });

            it("should remove link to original", function () {
                md.close();
                expect(md._original).to.be.equal(null);
            });

            it("should unsubscribe from original events", function () {
                var spy = sinon.spy();

                md.listenTo(md._original, "change", spy);
                md.close();
                m.set("x", 2);

                spy.callCount.should.to.be.equal(0);
            });
        });

        describe("events propagation", function () {
            var m, md;

            beforeEach(function () {
                m  = new Backbone.Model({ x: 1, y: 2 });
                md = new ModelDecorator(m, { z: 3, f: 4 });
            });

            it("should propagate original events", function () {
                var spy = sinon.spy();

                md.listenTo(md, "change", spy);
                md.listenTo(md, "change:x", spy);
                m.set("x", 2, { foo: 1 });

                spy.should.to.be.calledWith(m);
                spy.args[0].length.should.to.be.equal(3);
                spy.args[0][1].should.to.be.equal(2);
                spy.args[0][2].should.to.be.eql({ foo: 1 });

                spy.should.to.be.calledWith(m);
                spy.args[1].length.should.to.be.equal(2);
                spy.args[1][1].should.to.be.eql({ foo: 1 });
            });
        });
    });
});
