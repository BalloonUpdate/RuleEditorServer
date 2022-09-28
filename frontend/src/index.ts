// import 'font-awesome/css/font-awesome.css'
import App from "./components/App";
import BalloonNotification from "./components/BalloonNotification";
import './index.styl'

new BalloonNotification('#balloon-notification').initialize()
let app = new App('#app').initialize()
;(window as any).app = app