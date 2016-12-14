# simple-onesignal

> A simple wrapper for onesignal.  Used to send Push Notifications to end-users.

Sign up for free at: [onesignal.com](http://www.onesignal.com)

## Install

todo

## Setup

```
var onesignal = require('simple-onesignal');
onesignal.configure('[APP ID]', '[REST API KEY]');
```

## Usage

### Sending a message

#### Simple Text to everyone

The following code will send a message in English to *all* subscribers!
```
onesignal.sendMessage('Hello world!', function(err, resp) {
    if(err) {
        // Handle error
    } else {
        // Handle success!
    }
});
```

#### Message with specific messages and targeting
```
onesignal.sendMessage({
    contents: {en:'Hello world!'}, 
    included_segments:['All']
}, function(err, resp) {
    if(err) {
        // Handle error
    } else {
        // Handle success!
    }
});
```

### Convenience methods

The following methods essentially so the same as `sendMessage([data])`, but wrap some of the boiler plate up for you.

#### Send text to segments

The second argument is an array of your [segments](https://documentation.onesignal.com/reference#section-send-to-segments) configured in OneSignal.

```
onesignal.sendMessageTextToSegments('Hello world', ['All'], function(err, resp) {
    //...
});
```

#### Send text to 

The second argument is an array of your [filters](https://documentation.onesignal.com/reference#section-send-to-users-based-on-filters) configured in OneSignal.
In the example below, we are targeting users who have not opened the app for at least 12 hours.

```
var filters = [
    {field:'last_session', relation:'>', hours_ago:'12'}
]

onesignal.sendMessageTextWithFilters('Hello world', filters, function(err, resp) {
    //...
});
```

# License

&copy; Jamie Chapman, 57Digital Ltd — [ISC](https://tldrlegal.com/license/-isc-license)