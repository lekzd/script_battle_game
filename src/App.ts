import {ClientApp} from './player/ClientApp';
import {MasterApp} from './master/MasterApp';

(window as any).Client = ClientApp;
(window as any).Master = MasterApp;