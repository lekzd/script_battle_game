import {MasterApp} from './master/MasterApp';
import {ClientApp} from './common/client/ClientApp';
import {AdminApp} from './leaders/AdminApp';
import {IndexApp} from './leaders/IndexApp';

(window as any).Client = ClientApp;
(window as any).Master = MasterApp;
(window as any).Admin = AdminApp;
(window as any).Index = IndexApp;