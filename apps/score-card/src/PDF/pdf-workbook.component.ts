import { Component, effect, input, OnDestroy } from '@angular/core';
import jsPDF from 'jspdf';
import { combineLatest, debounce, interval, Subject, Subscription } from 'rxjs';
import { Question, questionGroup, User } from '../definitions';
import { UsersService } from '../service/users.service';
import { PdfUserComponent } from './pdf-user.component';
import { QuestionsService } from '../service/questions.service';

@Component({
  selector: 'app-pdf-water-safe',
  imports: [PdfUserComponent],
  templateUrl: './pdf-workbook.component.html',
  styleUrl: './pdf-workbook.component.css',
})
export class PdfWorkbookComponent implements OnDestroy {
  level = input.required<string>();
  id = input.required<string>();

  private execute$ = new Subject();

  user?: User;
  group?: questionGroup;
  questions?: Question[];
  page = 0;

  subs: Subscription[] = [];

  constructor(userService: UsersService, questionService: QuestionsService) {
    effect(() => {
      questionService.group = this.id();
    });

    this.subs.push(
      combineLatest([
        userService.currentUser$,
        questionService.selectedGroup$,
        questionService.allQuestions$,
      ]).subscribe(([user, group, answers]) => {
        this.user = user;
        this.group = group;
        this.questions = answers;

        if (!group.books) {
          group.books = {};
        }

        if (this.user && this.group && this.questions) {
          this.execute$.next('');
        }
      })
    );

    // pause the execution until all the data is loaded completely
    this.subs.push(
      this.execute$
        .pipe(debounce(() => interval(500)))
        .subscribe(() => this.print())
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach((x) => x.unsubscribe());
  }

  async print() {
    this.page = 0;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const title =
      this.group?.books.safe?.name || this.group?.name + ' Safe Participant';

    this.headings(doc);

    // const footer = `Page ${i} of ${pageCount}`;

    let y = this.createTitle(doc, 0, title);

    // y = this.instructions(y, doc, title);

    y = this.createUserBox(doc, y);

    this.verifiers(doc, y);

    doc.addPage('a4', 'portrait');

    this.headings(doc);

    doc.save(`${this.group?.name}-${this.level()}-workbook.pdf`);
  }

  // private instructions(y: number, doc: jsPDF, title: string) {
  //   const bullet = 43;
  //   const textLocation = 50;

  //   y += 10;
  //   doc.setFontSize(10);
  //   doc.setFont('helvetica', 'bold');
  //   doc.text(
  //     'This proficiency document is for use in the completion for the Scouts Australia requirements of',
  //     105,
  //     y,
  //     { align: 'center' }
  //   );
  //   y += 7;
  //   doc.text(title, 105, y, { align: 'center' });
  //   y += 7;
  //   doc.setFont('helvetica');
  //   this.bullet(doc, bullet, y);
  //   doc.text(
  //     'This document can be used as supporting evidence in the Outdoor Adventure Skills (OAS) Stage 5 Paddling',
  //     textLocation,
  //     y,
  //     { maxWidth: 135 }
  //   );
  //   y += 5; // extra line
  //   y += 7;
  //   this.bullet(doc, bullet, y);
  //   doc.text(
  //     'This document is aligned to the following units and can be used as partial evidence towards the Unit of Competency - SISOCNE001 Paddle a craft using fundamental skills',
  //     textLocation,
  //     y,
  //     { maxWidth: 135 }
  //   );
  //   y += 10; // two additional lines
  //   return y;
  // }

  createTitle(doc: jsPDF, y: number, title: string): number {
    y = 32;
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0);
    doc.setFillColor(204, 204, 204);
    doc.rect(18, 25, 167, 25, 'FD'); //Fill and Border
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ADVENTUROUS ACTIVITIES PROGRAM', 65, y);

    y += 8;
    doc.setFontSize(16);
    doc.setTextColor(255, 0, 0);
    doc.text(title, 67, y);

    y += 8;
    doc.setTextColor('black');
    doc.setFillColor('white');
    doc.text('Assessment of Proficiency', 86, y);

    doc.setFont('helvetica');
    return y;
  }

  headings(doc: jsPDF) {
    this.page++;
    const header =
      this.group?.books.safe?.heading ||
      this.group?.name + ' Safe Participant Workbook';
    const footer =
      this.group?.books.safe?.footing ||
      this.group?.name + ' Safe Participant Workbook';

    doc
      .setTextColor(173, 216, 230)
      .setFontSize(9)
      .setFont('helvetica')
      .text(header, 105, 13, { align: 'center' })

      .setTextColor(255, 3, 62)
      .text('Scouts Australia', 24, 275)

      .setTextColor(0, 0, 0)
      .text(`${this.page} | Page`, 170, 275)
      .text(footer, 105, 281, { align: 'center' });

    // location of top of the page...
    return 32;
  }

  verifiers(doc: jsPDF, y: number): number {
    y += 10;

    const box = 50;
    const start = 30;

    doc.text(
      'Who instructed or assisted you in your activity course and to complete the workbook',
      start,
      y
    );

    y += 4;

    doc.setDrawColor(0);

    [start, start + box, start + box + box].forEach((x) => {
      doc.setFillColor(204, 204, 204).rect(x, y, 50, 10, 'FD');
    });

    y += 6;
    doc
      .setFontSize(12)
      .setFont('helvetica', 'bold')
      .text('Name', start + 10, y)
      .text('Role', start + 10 + box, y)
      .text('Qualification', start + 10 + box + box, y);

    y += 4;
    doc.setFillColor('white');

    [1, 2, 3].forEach(() => {
      [start, start + box, start + box + box].forEach((x) => {
        doc.rect(x, y, 50, 10, 'FD');
      });
      y += 10;
    });

    y += 10;

    doc
      .setTextColor(255, 3, 62)
      .text(
        ' Youth Program - Outdoor Adventure Skills are to be recorded in Scouts Terrain',
        105,
        y,
        { align: 'center' }
      )
      .text(
        'Core Skills Trained Participant - Assessment of Proficiency',
        105,
        y + 8,
        { align: 'center' }
      )
      .setTextColor(0, 0, 0)
      .setFont('helvetica');

    y += 5;

    [1, 2, 3, 4].forEach(() => {
      y += 10;
      doc
        .setFillColor(204, 204, 204)
        .rect(start, y, box + 10, 10, 'FD')
        .setFillColor('white')
        .rect(start + box + 10, y, box + box - 10, 10, 'FD');
    });

    doc
      .text('Name', start + 3, y - 24)
      .text('Qualification & Number', start + 3, y - 14)
      .text('Date', start + 3, y - 4)
      .text('Signature', start + 3, y + 6);

    y += 20;

    doc
      .setFontSize(10)
      .text(
        'I certify that proficiency in Core Skills-Trained Participant has been attained by:',
        start,
        y
      )
      .line(start, y + 12, 170, y + 12, 'S');

    y += 12;

    return y;
  }

  bullet(doc: jsPDF, x: number, y: number) {
    doc.setFont('Zapfdingbats', 'normal').text('l', x, y).setFont('helvetica');
  }

  createUserBox(doc: jsPDF, y: number): number {
    y += 10;
    doc.setDrawColor('white');
    doc.setFillColor(204, 204, 204);
    doc.setFontSize(10);
    doc.setFont('helvetica');
    [
      { h: 'Branch or State', t: this.user?.state },
      { h: 'Members name', t: this.user?.name },
      { h: 'Membership Number', t: this.user?.scoutNumber },
      { h: 'Section', t: this.user?.section },
      { h: 'Phone', t: this.user?.phone },
      { h: 'Email', t: this.user?.email },
    ].forEach((data) => {
      doc.setFillColor(204, 204, 204);
      doc.rect(18, y, 40, 10, 'FD'); //Fill and Border
      y += 5;
      doc.text(data.h, 21, y);
      doc.text(data.t || '', 60, y);
      y += 5;
    });

    return y;
  }
}
