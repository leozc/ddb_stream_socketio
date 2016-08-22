var chai = require('chai');
var extend = require('util')._extend;
var expect = chai.expect; // we are using the "expect" style of Chai
var sf_device = require('../index.js');
const context = require('aws-lambda-mock-context');

describe('sf_device', function() {

  var event_base ={
    "sf_push_app_arn":"arn:aws:sns:us-west-2:284937987275:app/APNS/swiftfinder",
    "tb_deivce":"sf_devices_staging",
    "user-agent": "SwiftFinder/3.1.2 (iPhone; iOS 9.3.2; Scale/3.00)",
    "sf_config_ep":"current_config",
    "sf_config_ep_old":"old_current_config",
    "body": {
      //"operation": "discover", <-- override this value here
      "data": {
        "token": "09861ebad6b0b60a139ba3a9f374f889aa1c3bed811f16cfc08cc940ebdd30fd",
        "custom_user_data": {"d1":3,"d2":2,"f":""},
        "lat":1221,
        "long":4561,
        "turn_on_ad": true
      }
    }
  }

  describe('test basic feature and fields', function(){
    const ctx = context();
    var test_resp = null;
    var test_error = null;
    before(function(done){
      var my_event = extend({}, event_base)
      my_event.body.operation="discover"
      sf_device.handler(my_event, ctx);
      ctx.Promise
        .then(resp => { test_resp = resp; done(); })
        .catch(err => { test_error = err; done();})
    })

    it('discover should return different config based on the user agent passed in', function() {
      expect(test_error).to.equal(null);
      expect(test_resp.status).to.equal("ok");
      expect(test_resp.data['sf_client.register'].status).to.equal(true);
      expect(test_resp.data['sf_object.createOrUpdate'].status).to.equal(false);
      expect(test_resp.data['sf_object.read'].status).to.equal(false);
      expect(test_resp.data['sf_object.listByOwner'].status).to.equal(false);
      expect(test_resp.data['sf_object_history.listByOwner'].status).to.equal(false);
      expect(test_resp.data['sf_option.ads.enabled'].status).to.equal(true);

    });
  });

  describe('test old version', function(){
    const ctx = context();
    var test_resp = null;
    var test_error = null;
    before(function(done){
      var my_event = extend({}, event_base)
      my_event.body.operation="discover";
      //old version
      my_event["user-agent"]='SwiftFinder/3.1.2 (iPhone; iOS 9.3.2; Scale/3.00)';
      sf_device.handler(my_event, ctx);
      ctx.Promise
        .then(resp => { test_resp = resp; done(); })
        .catch(err => { test_error = err; done();})
    })

    it('discover should return different config based on the user agent passed in', function() {
      expect(test_error).to.equal(null);
      expect(test_resp.status).to.equal("ok");
      expect(test_resp.data['sf_config'].ios).to.equal('old_current_config');
    });
  });

  describe('test current version', function(){
    const ctx = context();
    var test_resp = null;
    var test_error = null;
    before(function(done){
      var my_event = extend({}, event_base)
      my_event.body.operation="discover";
      //old version
      my_event["user-agent"]='SwiftFinder/3.5.2 (iPhone; iOS 9.3.2; Scale/3.00)';
      sf_device.handler(my_event, ctx);
      ctx.Promise
        .then(resp => { test_resp = resp; done(); })
        .catch(err => { test_error = err; done();})
    })

    it('discover should return different config based on the user agent passed in', function() {
      expect(test_error).to.equal(null);
      expect(test_resp.status).to.equal("ok");
      expect(test_resp.data['sf_config'].ios).to.equal('current_config');
    });
  });

  describe('broken user-agent', function(){
    const ctx = context();
    var test_resp = null;
    var test_error = null;
    before(function(done){
      var my_event = extend({}, event_base)
      my_event.body.operation="discover";
      //old version
      my_event["user-agent"]='';
      sf_device.handler(my_event, ctx);
      ctx.Promise
        .then(resp => { test_resp = resp; done(); })
        .catch(err => { test_error = err; done();})
    })

    it('discover should return different config based on the user agent passed in', function() {
      expect(test_error).to.equal(null);
      expect(test_resp.status).to.equal("ok");
      expect(test_resp.data['sf_config'].ios).to.equal('old_current_config');
    });
  });

});
