import { GroupId } from './GroupId';
import { UserId } from './UserId';
import { answer } from './answer';

interface User {
  id: UserId;
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
