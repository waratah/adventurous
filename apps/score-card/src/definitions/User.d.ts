import { GroupId } from './GroupId';

interface User {
  verifyGroups: GroupId[];
  name: string;
  scoutNumber: string;
  state: string;
  section: string;
  group: string;
  email: string;
  phone: string;
}
