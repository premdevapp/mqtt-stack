var _ = require('underscore');

/**
 * InboundManager Middleware
 *
 * Manages incomming publish packets.
 */
var InboundManager = function(){};

/**
 * Handles 'publish' messages and executes 'relayMessage'. Sends
 * 'puback' for QoS1 messages.
 *
 * @param client
 * @param packet
 * @param next
 */
InboundManager.prototype.handle = function(client, packet, next){
  var self = this;
  if(packet.cmd == 'publish') {
    self.stack.execute('relayMessage',{
      client: client,
      packet: packet,
      topic: packet.topic,
      payload: packet.payload
    }, function(err){
      if(err) return next(err);
      if(packet.qos == 1) {
        client.puback({
          messageId: packet.messageId
        });
      }
    });
  } else {
    return next();
  }
};

module.exports = InboundManager;
