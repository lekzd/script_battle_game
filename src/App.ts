import {MasterApp} from './master/MasterApp';
import {ClientApp} from './common/client/ClientApp';
import {AdminApp} from './admin/AdminApp';
import {IndexApp} from './admin/IndexApp';

(window as any).Client = ClientApp;
(window as any).Master = MasterApp;
(window as any).Admin = AdminApp;
(window as any).Index = IndexApp;