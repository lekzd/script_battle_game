import {MasterApp} from './master/MasterApp';
import {ClientApp} from './common/client/ClientApp';

(window as any).Client = ClientApp;
(window as any).Master = MasterApp;