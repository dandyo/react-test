import { useState, useCallback, useRef, useEffect } from 'react'
import './App.css';
import useWebSocket, { ReadyState } from 'react-use-websocket';
const WS_URL = 'ws://127.0.0.1:8000';

function isUserEvent(message) {
  let evt = JSON.parse(message.data);
  return evt.type === 'userevent';
}

function isDocumentEvent(message) {
  let evt = JSON.parse(message.data);
  return evt.type === 'contentchange';
}

function App() {
  // const [num, setNum] = useRef(0)
  let num = useRef(0)
  // const [socketUrl, setSocketUrl] = useState('wss://echo.websocket.org');
  const [username, setUsername] = useState('dan');
  const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
    onOpen: () => {
      console.log('WebSocket connection established.');
    },
    share: true,
    filter: () => false,
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    if (username && readyState === ReadyState.OPEN) {
      sendJsonMessage({
        username,
        type: 'userevent'
      });
    }
  }, [username, sendJsonMessage, readyState]);

  function handleClick() {
    // setNum(num + 1)
    num.current = num.current + 1;
    alert('You clicked ' + num.current + ' times!');
  }

  useWebSocket(WS_URL, {
    share: true,
    onOpen: () => {
      console.log('WebSocket connection established.');
    }
  });

  function handleClickSendMessage() {
    console.log('handleClickSendMessage')

    sendJsonMessage({
      username,
      type: 'userevent'
    });
  }

  // function handleHtmlChange(e) {
  //   sendJsonMessage({
  //     type: 'contentchange',
  //     content: e.target.value
  //   });
  // }

  // const handleClickSendMessage = useCallback(() => sendMessage('Hello'), []);

  return (
    <div className="App">
      <div>{num.current}</div>
      <button onClick={handleClick}>Click</button>
      <button
        onClick={handleClickSendMessage}
      >
        Click Me to send 'Hello'
      </button>
      <History />
    </div>
  );
}

function History() {
  console.log('history');
  const { lastJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: isUserEvent
  });
  const activities = lastJsonMessage?.data.numHistory || [];
  return (
    <>
      <div>{activities}</div>
    </>
    // <ul>
    //   {activities.map((activity, index) => <li key={`activity-${index}`}>{activity}</li>)}
    // </ul>
  );
}

export default App;
