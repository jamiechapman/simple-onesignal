var assert = require('assert');
var request = require('request');
var _ = require('underscore');
var util = require('util');

var SOS = function() {};

/* Properties */
SOS._appId = null;
SOS._restKey = null;
SOS._serverEndpoint = 'https://onesignal.com/api/v1';

/* ----- Setup ------ */

/***
 * This method sets up the module with the required API keys to use OneSignal
 */
SOS.prototype.configure = function(appId, restKey, debug) {
    SOS._appId = appId;
    SOS._restKey = restKey;
    SOS._debug = debug;
};

/**
 * Use this to override the OneSignal REST API Endpoint
 */
SOS.prototype.setServerEndpoint = function(serverEndpointUri) {
    this._serverEndpoint = serverEndpointUri;
}

/* ------ Messages ------- */

SOS.prototype.sendMessage = function(data, cb) {
    if(this._isSetup()) {

        // If the data is just a string, transform into a `contents` object as required by OneSignal
        // Note: this will also send to "ALL" subscribers too! If you do not want this behaviour, you should
        // send data to this method instead in the same format below:-
        if(typeof data === 'string') {
            data = {contents:{en:data}, included_segments:['All']};
        }

        // Make sure the push contents has a message
        if(typeof data.contents !== 'undefined') {
            if(Object.keys(data.contents).length === 0) {
                cb('OneSignal pre-flight error: data.contents contains no keys. You must have at least an `en` key like this: `{contents:{en:"Hello World"}}`');
                return;
            } else if(typeof data.contents.en === 'undefined') {
                cb('OneSignal pre-flight error: data.contents.en is missing, for some reason you must have at least English in your push payload `{contents:{en:"Hello World"}}`');
                return;
            }
        }

        SOS.prototype._execHttpRequest('/notifications', 'POST', data, cb);
    }
};

SOS.prototype.sendMessageTextToSegments = function(messageText, segments, cb) {
    SOS.prototype.sendMessage({
        contents: {en: messageText},
        included_segments: segments
    }, cb);
};

SOS.prototype.sendMessageTextWithFilters = function(messageText, filters, cb) {
    if(Array.isArray(filters)) {
        SOS.prototype.sendMessage({
            contents: {en: messageText},
            filters: filters
        }, cb);
    } else {
        cb('OneSignal pre-flight error: filters used in `sendMessageTextWithFilters` method is not an array!');
        return;
    }
};

/* Utils */

SOS.prototype._isSetup = function() {
    if(SOS._appId === null || typeof SOS._restKey === null) {
        throw new Error('OneSignal App ID and Rest Key not setup yet! use `configure([APP ID], [REST KEY])`.');
    } else {
        return true;
    }
};

SOS.prototype._execHttpRequest = function(url, method, data, cb) {

    // Make url
    url = util.format("%s/%s", SOS._serverEndpoint, url);

    // Inject App ID into payload
    data.app_id = SOS._appId;
    
    if (SOS._debug) console.log(data);

    request.post({
        url: url,
        method: method,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Authorization': util.format('Basic %s', SOS._restKey)
        },
        body: JSON.stringify(data)
    }, function(err, response, responseBody) {
        if(!err && response.statusCode === 200) {
            cb(null, responseBody);
        } else {
            if(typeof responseBody !== 'undefined') {
                var errorResponse = JSON.parse(responseBody);
                if(typeof errorResponse.errors !== 'undefined') {
                    cb(util.format("OneSignal came back with errors: %s", errorResponse.errors.join(', ')));
                } else {
                    cb('Could not connect to OneSignal, HTTP error: ' + response.statusCode);
                }
            } else {
                cb('Error connecting to OneSignal! HTTP response code ' + response.statusCode);
            }
        }
    });
};

module.exports = new SOS();
