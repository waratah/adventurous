import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  getDocs,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { GroupId, PageDisplay, question, questionGroup } from '../definitions';
import { combineLatest, map, ReplaySubject, take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class QuestionsService {
  private baseline: question[] = [
    { code: 1, text: 'Provide First Aid', attachmentRequired: true },
    { code: 2, text: 'Wilderness First Aid', attachmentRequired: true },
    {
      code: 10,
      text: 'I have been involved in checking the safety of an activity and reviewing and updating an activity risk assessment.',
    },
    {
      code: 11,
      text: 'I can follow procedures and controls on an activity and report hazards. I understand the typical hazards of activities.',
    },
    {
      code: 12,
      text: ' I understand the basis of Scouts WHS policy in legislation and my responsibilities toward duty of care to others',
    },
    {
      code: 13,
      text: 'I understand the emergency equipment and PPE required for various Adventurous Activities.',
    },
    {
      code: 14,
      text: 'I can outline the emergency procedures for an activity I have been on.',
    },
    {
      code: 15,
      text: 'I know how to raise an incident report and where to do that.',
    },
    {
      code: 16,
      text: 'I can explain Adventurous Activities policies and work and safety procedures within the Core Conduct Procedure.',
    },
    /** Session: Maintain sport, fitness and recreation industry knowledge */
    {
      code: 18,
      text: 'I have taken part in and logged four opportunities to update my skills, including Training, discussing with Leaders, working with my peers, and becoming involved with Scouts AA Teams.',
    },
    {
      code: 19,
      text: 'I have suggested and logged three opportunities to improve AA practices based on what I have learned.',
    },
    {
      code: 20,
      text: 'I can outline sources of information on Adventurous Activities.',
    },
    {
      code: 21,
      text: 'I can explain how Scouts NSW AA is structured and the available roles and opportunities.',
    },
    {
      code: 22,
      text: 'I understand the various obligations outlined in NSW Scouts Policy, such as child-safe practices, drugs, and equal opportunity.',
    },
    /** Session: Assist in conducting recreation sessions */
    {
      code: 24,
      text: "I have helped set and deliver three Adventurous Activities and followed my role and the leader's direction. I communicate clearly and positively with all participants.",
    },
    { code: 25, text: 'I have participated in activity debriefs.' },
    {
      code: 26,
      text: 'I have addressed three participant problems on Adventurous Activities around non-compliance or safety.',
    },
    {
      code: 27,
      text: 'I have addressed three equipment issues or faults that have arisen during activities.',
    },
    {
      code: 28,
      text: "I can explain an Activity Plan and Risk Assessment for an activity I've been on, outlining my role in safety and emergencies and the hazards and risks expected.",
    },
    {
      code: 29,
      text: 'I understand different motivations for participating in Adventurous Activities.',
    },
    {
      code: 30,
      text: 'I know my role and the roles of others in activities, including Guides.',
    },
    {
      code: 31,
      text: 'I can outline the appropriate clothing, footwear and other equipment for an activity and how age, size, experience and physical capability impact choice.',
    },
    {
      code: 32,
      text: 'I can discuss appropriate communication on an activity and ways to brief participants, encourage, provide feedback and address rule breaches.',
    },
    /** Session: Minimise environmental impact */
    {
      code: 34,
      text: "I can source information about an activity's environment, cultural and heritage aspects and brief others.",
    },
    {
      code: 36,
      text: 'On three Adventurous Activities, I have promoted practices that reduce the impact on the environment and comply with Scouts NSW Policies.',
    },
    {
      code: 37,
      text: 'I can discuss how an Activity Plan can outline approaches to minimise environmental impact and discuss the seven no trace principles.',
    },
    /** 'Session: Select, set up and operate a temporary or overnight site */
    {
      code: 39,
      text: "I can plan meals that meet one activity's daily fluid, energy and nutritional requirements.",
    },
    {
      code: 40,
      text: 'I have, on two occasions, set up and operated a temporary rest and meal stop ensuring sound food-handling environmental and safety practices.',
    },
    {
      code: 41,
      text: 'I have selected and set up an overnight camp with no permanent facilities, including addressing toileting needs.',
    },
    {
      code: 42,
      text: 'I can explain various factors that determine the choice of meal and camping sites.',
    },
    {
      code: 43,
      text: 'I can outline the hazards possible when choosing sites.',
    },
    {
      code: 44,
      text: 'I can outline the environment protection practices specific to camping.',
    },
    {
      code: 45,
      text: 'I can describe shelter and other equipment features in different conditions.',
    },
    {
      code: 46,
      text: 'I know the principles of selecting food, including nutrition balance, methods of cooking, and food storage.',
    },
    { code: 47, text: 'I can describe safe manual handling practices.' },
    {
      code: 48,
      text: 'I know the importance of loading equipment and supplies for access and weight distribution.',
    },

    { code: 53, text: 'I can demonstrate methods of increasing friction' },
    {
      code: 54,
      text: 'I can demonstrate a thorough self-check before abseiling',
    },
    { code: 55, text: 'I can safely buddy-check a companion before abseiling' },
    {
      code: 56,
      text: 'During descent, I can demonstrate an efficient UNIVERSAL LOCK OFF, and release',
    },

    /** Abseiling safe participant */
    {
      code: 57,
      text: 'I can explain the advantages and disadvantages of a device lock off',
    },
    {
      code: 58,
      text: 'I can demonstrate knots required for/and suitable lengths for prussic loops',
    },
    {
      code: 59,
      text: 'I can demonstrate self belay during descent including release of locked self belay.',
    },
    {
      code: 60,
      text: 'I participate in discussions about the risks and precautions taken during rope mobility',
    },
    {
      code: 61,
      text: 'ascend  rope on natural surface  (prussik), including over an edge',
    },
    { code: 62, text: 'discuss the importance of different attachment points' },
    {
      code: 63,
      text: 'Independently descend part way (at least three metres) and switch to ascent to top',
    },
    {
      code: 64,
      text: 'Independently ascend  part way (at least four metres) and switch to safe  descent',
    },
    {
      code: 65,
      text: 'I can independently and safely cross a knot during descent',
    },
    {
      code: 66,
      text: 'I can independently and  safely continue descent onto another rope',
    },
    {
      code: 67,
      text: 'I have demonstrated safe and effective decisions in 3 challenge scenarios',
    },
    {
      code: 68,
      text: 'I have assisted with checking equipment for damage and discussed if it needs to be repaired or replaced',
    },
    { code: 69, text: 'I have assisted with logging of equipment used' },
    {
      code: 70,
      text: 'I have noted what I have learned today, and contemplated what could be done differently',
    },
    {
      code: 71,
      text: 'I have recorded the skills that I practice as well as achieved',
    },

    /** Canoeing safe participant */
    {
      code: 101,
      text: 'I have completed three trips under the direction of a leader following an Activity Plan',
    },
    {
      code: 102,
      text: 'I can propel a craft using forward and reverse paddle',
    },
    {
      code: 103,
      text: 'I can control a craft sideways using draw stroke',
    },
    {
      code: 104,
      text: 'I can control a craft using forward and reverse sweep',
    },
    {
      code: 105,
      text: 'I can control a craft change direction using stern rudder',
    },
    {
      code: 106,
      text: 'I can control a craft using low support',
    },
    {
      code: 107,
      text: 'I can control a craft using emergency stop',
    },
    {
      code: 109,
      text: 'I can control a craft using J Stroke',
    },
    {
      code: 110,
      text: 'I have participated in two simulated capsize self rescues swimming myself and my canoe 50 metres to shore.',
    },
    {
      code: 111,
      text: 'I understand organisation procedures for canoeing activities and the role of Risk Assessment and an Activity Plan.',
    },
    {
      code: 112,
      text: 'I can explain clothing and reasons for layering, types of footwear and exposure protection (sun, wind and water).',
    },
    {
      code: 113,
      text: 'I can explain parts of a paddle and canoe and how to store equipment in the canoe.',
    },
    {
      code: 114,
      text: 'I can explain the features of a PFD and how to fit and adjust.',
    },
    {
      code: 115,
      text: 'I can detail the calls and communications, including whistles and paddle signals',
    },
    {
      code: 116,
      text: 'I can demonstrate safe manual handling techniques, including safely moving the canoe and embarking and disembarking.',
    },
    {
      code: 117,
      text: 'I can list typical hazards and controls likely when canoeing on flat water',
    },
    {
      code: 118,
      text: 'I can explain effective paddle techniques, including the position of hands, paddle entry and recovery, core stability and trunk rotation.',
    },
    {
      code: 119,
      text: 'I explain methods to self-rescue, including extricating from a capsize and a deep water re-entry.',
    },
    {
      code: 120,
      text: 'I have completed three trips under the direction of a leader following an Activity Plan. One trip includes a solo paddle.',
    },

    /** trained participant */
    {
      code: 130,
      text: 'I have completed three trips under the direction of a leader following an Activity Plan. One trip includes a solo paddle.',
    },
    {
      code: 131,
      text: 'I can control a craft forward, reverse and change direction using:',
    },
    {
      code: 132,
      text: '• forward and reverse paddle',
    },
    {
      code: 133,
      text: '• forward and reverse sweep',
    },
    {
      code: 134,
      text: '• bow draw strokes',
    },
    {
      code: 135,
      text: '• feathered and sculling draw',
    },
    {
      code: 136,
      text: '• forward J stroke',
    },
    {
      code: 137,
      text: '• low support',
    },
    {
      code: 138,
      text: '• emergency stop',
    },
    {
      code: 139,
      text: 'I have participated in two simulated capsize self rescues swimming myself and my canoe 50 metres to shore.',
    },
    {
      code: 140,
      text: 'I have completed three deepwater rescues using X, T or curl rescues.',
    },
    {
      code: 141,
      text: 'I have provided one contact tow and one tow with a towline and quick release system.',
    },
    {
      code: 142,
      text: 'I understand organisation procedures for canoeing activities and the role of Risk Assessment and an Activity Plan.',
    },
    {
      code: 143,
      text: 'I can explain clothing and reasons for layering, types of footwear and exposure protection (sun, wind and water).',
    },
    {
      code: 144,
      text: 'I can explain parts of a paddle and canoe, how to store equipment in the canoe, and how to adjust to managing stability and trim.',
    },
    {
      code: 145,
      text: 'I can explain the features of a PFD and how to fit and adjust.',
    },
    {
      code: 146,
      text: 'I can detail the calls and communications, including whistles and paddle signals.',
    },
    {
      code: 147,
      text: 'I can demonstrate safe manual handling techniques, including safely transporting, lifting, securing and moving the canoe.',
    },
    {
      code: 148,
      text: 'I can list typical hazards and controls likely when canoeing on flat water.',
    },
    {
      code: 149,
      text: 'I can outline techniques to embark and disembark.',
    },
    {
      code: 150,
      text: 'I can explain effective paddle techniques, including the position of hands, paddle entry and recovery, core stability and trunk rotation.',
    },
    {
      code: 151,
      text: 'I explain the advantages of different types of deep water rescues and the roles and responsibilities in a rescue.',
    },
    {
      code: 152,
      text: 'I can tie appropriate knots for canoeing, including tying on, joining and quick release.',
    },
  ];
  private groups: questionGroup[] = [
    {
      id: 1,

      name: 'Base Questions',
      pages: [
        {
          level: '',
          questions: [
            1, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
            26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 41, 42, 43,
            44, 45, 46, 47, 48, 49, 50,
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Abseil',
      pages: [
        {
          level: 'safe',
          questions: [
            1, 2, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67,
            68, 69, 70, 71,
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Canyon',
      pages: [
        {
          level: 'safe',
          questions: [1, 2, 3, 4, 5],
        },
      ],
    },
    {
      id: 4,
      name: 'Canoeing',
      pages: [
        {
          level: 'safe',
          questions: [
            1, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113,
            114, 115, 116, 117, 118,
          ],
        },
        {
          level: 'trained',
          questions: [
            141, 142, 143, 144, 145, 146, 147, 148, 149, 150, 151, 152, 153,
            154, 155, 156, 157, 158,
          ],
        },
      ],
    },
  ];

  private currentGroupId = new ReplaySubject<GroupId>(1);
  /** Provide the last read gate in list (zero is all) */
  groupId$ = this.currentGroupId.asObservable();

  private currentGroup = new ReplaySubject<questionGroup>(1);
  /** Provide the last read gate in list (zero is all) */
  selectedGroup$ = this.currentGroup.asObservable();

  private allQuestions = new ReplaySubject<question[]>(1);
  private allGroups = new ReplaySubject<questionGroup[]>(1);
  /** Provide the last read gate in list (maybe outdated, loaded from backend on start up) */
  allQuestions$ = this.allQuestions.asObservable();
  allQuestionGroups$ = this.allGroups.asObservable();
  questions$ = combineLatest([
    this.allQuestions$,
    this.allQuestionGroups$,
    this.groupId$,
  ]).pipe(
    map(([questions, groups, groupId]) => {
      const list: PageDisplay[] = [];
      if (!groupId) {
        list.push({ heading: 'All questions', questions, show: true });
        return list;
      }
      const questionLink = groups.find((x) => x.id === groupId);
      if (!questionLink) {
        list.push({ heading: 'newGroup', questions, show: true });
        return list;
      }
      return questionLink.pages.map(
        (p) =>
          <PageDisplay>{
            show: true,
            heading: p.level,
            questions: questions.filter((x) =>
              p.questions.some((l) => l === x.code)
            ),
          }
      );
    })
  );

  constructor(private store: Firestore) {
    this.currentGroupId.next(0);
    this.allQuestions.next(this.baseline);
    this.allGroups.next(this.groups);
    this.loadQuestions();
    this.loadGroups();
  }

  set group(id: GroupId) {
    this.currentGroupId.next(id);
    this.allQuestionGroups$.pipe(take(1)).subscribe((list) => {
      if (list) {
        const group = list.find((g) => g.id === id);
        if (group) {
          this.currentGroup.next(group);
        }
      }
    });
  }

  private loadQuestions() {
    getDocs(collection(this.store, 'questions'))
      .then((d) => {
        const list: question[] = [];
        d.forEach((q) => {
          const quest = q.data() as question | undefined;
          if (quest) {
            quest.code = Number(q.id);
            list.push(quest as question);
          }
        });
        this.allQuestions.next(list.sort((x) => x.code));

        // insert any questions that were added to baseline questions into database
        this.baseline.forEach((q) => {
          if (!list.find((x) => x.code === q.code)) {
            try {
              this.updateQuestion(q);
            } catch (e) {
              console.error(e);
            }
          }
        });
      })
      .catch((x) => console.error(x));
  }

  private loadGroups() {
    getDocs(collection(this.store, 'groups'))
      .then((d) => {
        const list: questionGroup[] = [];
        d.forEach((q) => {
          const quest = q.data() as questionGroup | undefined;
          if (quest) {
            quest.id = Number(q.id);
            list.push(quest as questionGroup);
          }
        });
        this.groups = list.sort((a, b) => a.name.localeCompare(b.name));
        this.allGroups.next(this.groups);
      })
      .catch((x) => console.error(x));
  }

  public updateQuestion(q: question) {
    const docRef = doc(this.store, 'questions', `${q.code}`);
    const temp = { ...q };
    delete temp.code;
    setDoc(docRef, temp).catch((x) => console.error(x));
  }

  public createGroup(name: string) {
    const id = Math.max(...this.groups.map((x) => x.id)) + 1;
    const group: questionGroup = { id: id, name: name, pages: [] };
    this.groups.push(group);
    this.saveGroup(id, []);
  }

  public saveGroup(groupId: number, groups: PageDisplay[]) {
    const og = this.groups.find((x) => x.id === groupId);
    const group: questionGroup = {
      id: groupId,
      name: og ? og.name : 'New Name',
      pages: groups.map((x) => ({
        level: x.heading,
        questions: x.questions.map((q) => q.code),
      })),
    };

    const ng = this.groups.filter((x) => x.id != groupId);
    ng.push(group);

    this.groups = ng;
    this.allGroups.next(this.groups);

    const docRef = doc(this.store, 'groups', `${groupId}`);
    setDoc(docRef, group).catch((x) => console.error(x));
  }
}
