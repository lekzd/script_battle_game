import {MasterApp} from './master/MasterApp';
import {ClientApp} from './common/client/ClientApp';
import {LeadersApp} from './leaders/LeadersApp';

(window as any).Client = ClientApp;
(window as any).Master = MasterApp;
(window as any).Leaders = LeadersApp;