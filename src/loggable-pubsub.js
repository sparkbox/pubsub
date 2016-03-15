pubsub.log = {};
pubsub.origPublish = pubsub.publish;
pubsub.origSubscribe = pubsub.subscribe;

pubsub._getCallerID = function(args, stackInfo) {
  var caller;

  if (args.callee && args.callee.caller) {
    caller = args.callee.caller;

    if ((caller.name === 'publish' || caller.name === 'subscribe') && args.callee.caller.caller) {
      caller = args.callee.caller.caller;
    }
  }

  return (caller && caller.name ? caller.name : 'anonymous') + ';' + stackInfo;
};

pubsub._getStackInfo = function(stack) {
  var caller_line, index, clean, source;

  caller_line = stack.split('\n')[2];
  index = caller_line.indexOf('at ');
  clean = caller_line.slice(index + 2, caller_line.length);
  source = clean.match(/.*\(*http:\/\/(.*)\)*/);

  return source ? source[1].replace('localhost:8000/', '') : '';
};

pubsub.publish = function(topic, args) {
  var context = {
        topic: topic,
        stack: null,
      },
      stackInfo;

  try {
    throw new Error('Track ps.publish');
  } catch (e) {
    context.stack = e.stack;
  }

  stackInfo = ps._getStackInfo(context.stack);

  ps.log[topic] = ps.log[topic] || { publishers: [], subscribers: [] };
  ps.log[topic].publishers.push({
    stack: context.stack,
    method_name: ps._getCallerID(arguments, stackInfo),
    method_body: this,
  });

  args = args || [];
  args.push(context);

  pubsub.origPublish(topic, args);
};

pubsub.subscribe = function(topic, callback) {
  var context = {
        topic: topic,
        stack: null,
      },
      stackInfo;

  try {
    throw new Error('Track ps.subscribe');
  } catch (e) {
    context.stack = e.stack;
  }

  stackInfo = ps._getStackInfo(context.stack);

  ps.log[topic] = ps.log[topic] || { publishers: [], subscribers: [] };
  ps.log[topic].subscribers.push({
    stack: context.stack,
    methodName: ps._getCallerID(arguments, stackInfo),
    methodBody: this,
  });

  pubsub.origSubscribe(topic, callback);
};

pubsub.diagram = function() {
  var data = '',
      publishingMethods,
      subscribingMethods,
      combos;

  _.forEach(ps.log, function(topic, key) {

    publishingMethods = _.map(topic.publishers, function(p) { return p.methodName; });
    subscribingMethods = _.map(topic.subscribers, function(p) { return p.methodName; });
    combos = _.zip(subscribingMethods, publishingMethods);

    _.forEach(combos, function(combo) {
      var item = '';

      if (combo[0]) {
        item += '[' + combo[0] + '{bg:steelblue}]->[' + key + ']';
      }

      if (combo[1]) {
        item += '[' + key + ']->[' + combo[1] + '{bg:seagreen}]';
      }

      if (combo[0] || combo[1]) {
        item += ',';
      }

      data += item;
    });

  });

  window.open('http://yuml.me/diagram/normal;dir:TB/class/' + encodeURIComponent(data), '_blank');
};
