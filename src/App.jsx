import './App.css';
import { SendMessageComponent } from './components/SendMessageComponent/SendMessageComponent';
import { ViewMessageComponent } from './components/ViewMessageComponent/ViewMessageComponent';
function App() {
  return (
    <div className="main_wrapper">
      <div className="main_container">
        <div className="chat-title">
          <h1>Евгений Цыганков</h1>
          <h2>FrontEnd Developer </h2>
          <figure className="avatar">
            <img src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156381/profile/profile-80.jpg" />
          </figure>
        </div>
        <ViewMessageComponent />
        <SendMessageComponent />
      </div>
    </div>
  );
}

export default App;
