import { GroupId } from './GroupId';
import { answer } from './answer';

interface User {
  verifyGroups: GroupId[];
  name: string;
  scoutNumber: string;
  state: string;
  section: string;
  group: string;
  email: string;
  answers?: answer[];
  phone: string;
}
