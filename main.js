(function(){
  var element = function(id){
    return document.getElementById(id);
  }

  //Get Elements
  var status = element('status');
  var messages = element('messages');
  var textarea = element('textarea');
  var username = element('username');
  var clearBtn = element('clear');

  var statusDefault = status.textContent;

  var setStatus = function(s){
    // set status
    status.textContent= s;
    if(s !== statusDefault){
      var delay = setTimeout(function(){
        setStatus(statusDefault);
      }, 2000);

    }
  }
  // connect to socket.io
  var socket = io.connect(':3000');

  //Check for connection
  if(socket !== undefined){
    console.log('Connected to socket...');

    //Handle Output
    socket.on('output',function(data){
      if(data.length){
        for(var i=0; i<data.length; i++){
          // Build out message Div
          var message = document.createElement('div');
          message.setAttribute('class', 'chat-message');
          message.textContent = data[i].name+": "+data[i].message;
          messages.appendChild(message);
          messages.insertBefore(message,messages.firstChild);
        }
      }
    });

    // Get status from Server
    socket.on('status', function(data){
      //get message status
      setStatus((typeof data === 'object')? data.message : data);

      //if status is clear, clear text
      if(data.clear){
        textarea.value = '';
      }
    });
    //Handle Input
    textarea.addEventListener('keydown', function(event){
      if(event.which === 13 && event.shiftKey == false){
        //emit to server input
        socket.emit('input', {
          name: username.value,
          message:textarea.value
        });

        event.preventDefault();
      }
    });

    // handle chat clear
    clearBtn.addEventListener('click', function(){
      socket.emit('clear');
    });
    socket.on('cleared', function(){
      messages.textContent = '';
    });

  }
})();