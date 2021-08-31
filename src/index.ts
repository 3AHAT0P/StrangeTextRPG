import 'reflect-metadata';
import { getConfig } from 'ConfigProvider';
import { App } from 'App';
import { DIFactory } from '@utils/DI';

const config = getConfig();
const app = DIFactory<typeof App>(App);
app.init(config.MAIN_UI);
