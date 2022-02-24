import { getConfig } from 'ConfigProvider';
import { App } from 'App';

const config = getConfig();
const app = new App(config.MAIN_UI);
app.init();
