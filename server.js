const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(3000).sockets;

//Connecting to mongo
mongo.connect('mongodb://127.0.0.1/mongochat', function(err,db){
  if(err){
    throw err;
  }
  console.log('MongoDB connected...');

  //Connect to Socket.io
  client.on('connection',function(socket){
    let chat = db.collection('chats');

    //Create function to send status
    sendStatus = function(status){
      socket.emit('status', status);
    }

    //get chats from mongo collection
    chat.find().limit(100).sort({_id:1}).toArray(function(err, res){
      if(err){
        throw err;
      }

      //Emit the messages.
      socket.emit('output',res);

    });

    //Hane input events
    socket.on('input', function(data){
      let name = data.name;
      let message = data.message;

      // Check for name and message
      if(name == '' || message == ''){
        // send error status
        sendStatus('Please enter a name and message');
      } else {
        //Insert message
        chat.insert({name: name, message: message}, function(){
          client.emit('output',[data]);

          // Send status object
          sendStatus({
            message: 'Message Sent',
            clear: true
          });
        });
      }
    });

    socket.on('clear', function(data){
      // Remove all chats from collection
      chat.remove({},function(){
        // emit cleared
        socket.emit('cleared');

      });
    });
  });
});