import { Component, effect, input, OnDestroy } from '@angular/core';
import jsPDF from 'jspdf';
import { combineLatest, debounce, interval, Subject, Subscription } from 'rxjs';
import { answer, Question, questionGroup, User } from '../definitions';
import { UsersService } from '../service/users.service';
import { PdfUserComponent } from './pdf-user.component';
import { QuestionsService } from '../service/questions.service';
import { page } from '../definitions/questionGroup';
import { AnswersService } from '../service/answers.service';

@Component({
  selector: 'app-pdf-water-safe',
  imports: [PdfUserComponent],
  templateUrl: './pdf-workbook.component.html',
  styleUrl: './pdf-workbook.component.css',
})
export class PdfWorkbookComponent implements OnDestroy {
  level = input.required<string>();
  id = input.required<string>();

  readonly lineStart = 25;
  readonly lineWidth = 160;
  readonly pageTop = 32;
  readonly pageBottom = 265;
  readonly cssPixelSize = 0.2645833333;

  private execute$ = new Subject();

  user?: User;
  group?: questionGroup;
  questions?: Question[];
  answers?: answer[];
  page = 0;

  subs: Subscription[] = [];

  constructor(userService: UsersService, questionService: QuestionsService, answersService: AnswersService) {
    effect(() => {
      questionService.group = this.id();
    });

    answersService.userId = userService.userId;

    this.subs.push(
      combineLatest([
        userService.currentUser$,
        questionService.selectedGroup$,
        questionService.allQuestions$,
        answersService.answers$,
      ]).subscribe(([user, group, questions, answers]) => {
        this.user = user;
        this.group = group;
        this.questions = questions;
        this.answers = answers || [];

        if (!group.books) {
          group.books = {};
        }

        if (this.user && this.group && this.questions) {
          this.execute$.next('');
        }
      })
    );

    // pause the execution until all the data is loaded completely
    this.subs.push(this.execute$.pipe(debounce(() => interval(500))).subscribe(() => this.print()));
  }

  ngOnDestroy(): void {
    this.subs.forEach(x => x.unsubscribe());
  }

  async print() {
    this.page = 0;

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const title = this.group?.books.safe?.name || this.group?.name + ' Safe Participant';

    this.headings(doc);

    // const footer = `Page ${i} of ${pageCount}`;

    let y = this.createTitle(doc, 0, title);

    // y = this.instructions(y, doc, title);

    y = this.createUserBox(doc, y);

    this.verifiers(doc, y);

    await this.printSections(doc);

    doc.save(`${this.group?.name}-${this.level()}-workbook.pdf`);
  }

  async printSections(doc: jsPDF) {
    if (!this.group) {
      return;
    }

    let y = this.pageTop;
    const sectionBuffer = 50;
    const lineBuffer = 10;

    let sectionIndex = 0;
    let questionIndex = 0;

    const sections = this.group.pages.filter(x => x.level === this.level());
    let current: page | undefined = sections[0];

    do {
      doc.addPage('a4', 'portrait').setDrawColor(0);
      y = this.headings(doc);
      while (y < this.pageBottom - sectionBuffer && current) {
        if (y != 32) {
          y += 10;
        }
        doc
          // .setFillColor(204, 204, 204);
          .rect(this.lineStart, y - 6, this.lineWidth, 10)
          .setFontSize(12)
          .setFont('helvetica', 'bold')
          .text(current.heading, 30, y)
          .setFont('helvetica')
          .setFontSize(10);

        y += 8;

        if (current.description) {
          const fontSize = 9;
          doc.setFontSize(fontSize);

          // break description on lines,  print each adn estimate the height.
          current.description.split(/\r\n|\r|\n/).forEach(line => {
            if (line) {
              const width = this.lineWidth - 5;
              doc.text(line, this.lineStart, y, { maxWidth: width });
              const totalWidth = doc.getTextWidth(line);
              const lines = Math.floor(totalWidth / width) + 1;
              y += (lines + 1) * 3.2; // 9 point is about 3.175
            }
          });
          y += 8;
          doc.setFontSize(10);
        }
        let myQuestion = current.questions[questionIndex];

        while (myQuestion && y < this.pageBottom - lineBuffer) {
          const asked = this.questions?.find(x => x.code === myQuestion);
          const answer = this.answers?.find(x => x.code === myQuestion);

          if (asked) {
            switch (asked.type) {
              case '':
              case 'checkbox':
                doc.setDrawColor(0, 0, 0).rect(this.lineWidth - 5, y - 4, 5, 5);

                y = this.textHeight(doc, asked.text, this.lineStart, y, this.lineWidth - 10, 10).y;

                if (answer?.done) {
                  doc.text('x', this.lineWidth - 4, y);
                }
                y += 4;
                break;

              case 'textbox':
                y = this.textHeight(doc, asked.text, this.lineStart, y, this.lineWidth - 10, 10).y;
                y += 5;
                if (answer?.text) {
                  const temp = this.textHeight(doc, answer.text, this.lineStart + 2, y + 1, this.lineWidth - 4, 10);
                  const boxHeight = temp.extraLines * temp.lineHeight + temp.lineHeight + 4;
                  doc.setDrawColor(192, 192, 192).rect(this.lineStart, y - 3, this.lineWidth, boxHeight);
                  y = temp.y + 3;
                } else {
                  doc.setDrawColor(0, 0, 0).rect(this.lineStart, y - 3, this.lineWidth, 5);
                }

                y += 6;
                break;

              case 'img':
                if (asked.img) {
                  const img = await this.imageUrlToBase64(asked.img);

                  const size = await this.getImageDimensions(img);
                  console.log(size);
                  const newSize = { width: size.width * this.cssPixelSize, height: size.height * this.cssPixelSize };
                  if( newSize.width < this.lineWidth) {
                    doc.addImage(img, 'png', this.lineStart, y, newSize.width, newSize.height);
                  }
                  y += newSize.height + 4;
                } else {
                  y = this.textHeight(doc, asked.text, this.lineStart, y, this.lineWidth - 10, 10).y;
                }
                break;

              case 'url':
                doc.text(asked.text, this.lineStart, y, {
                  maxWidth: this.lineWidth,
                });
                y += 8;
                break;
            }
          }

          questionIndex++;
          myQuestion = current.questions[questionIndex];
        }

        if (questionIndex >= current.questions.length) {
          sectionIndex++;
          questionIndex = 0;
          current = sections[sectionIndex];
        }
      }
    } while (current);
  }

  textHeight(doc: jsPDF, text: string, x: number, y: number, width: number, fontSize: number) {
    let lineHeight = 10;
    switch (fontSize) {
      case 9:
        lineHeight = 3.2;
        break;
      case 10:
        lineHeight = 3.6;
        break;
      default:
        console.error(`${fontSize} is not defined default of 10 used`);
        break;
    }
    doc.text(text, x, y, { maxWidth: width });

    // this is sometimes inaccurate due to very long words like URLs
    const w = doc.getTextWidth(text);
    const extraLines = Math.floor(w / width);
    y += extraLines * lineHeight;
    return { y, extraLines, lineHeight };
  }

  loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      this.imageUrlToBase64(url)
        .then(base64 => {
          img.src = base64;

          // const canvas = document.createElement('canvas');
          // canvas.width = img.width;
          // canvas.height = this.lineWidth;
          // const ctx = canvas.getContext('2d');
          // if (ctx) {
          //   ctx.drawImage(img, 0, 0);
          //   resolve(canvas);
          // }
          resolve(img);
        })
        .catch(x => reject(x));
    });
  }

  getImageDimensions(base64: string) {
    return new Promise<{ width: number; height: number }>(function (resolved) {
      const img = new Image();
      img.onload = () => {
        resolved({ width: img.width, height: img.height });
      };
      img.src = base64;
    });
  }

  async imageUrlToBase64(url: string) {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result;
        resolve(base64data as string);
      };
      reader.onerror = reject;
    });
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
    doc
      .setTextColor(0, 0, 0)
      .setDrawColor(0)
      .setFillColor(204, 204, 204)
      .rect(18, this.lineStart, this.lineWidth, 25, 'FD') //Fill and Border
      .setFontSize(16)
      .setFont('helvetica', 'bold')
      .text('ADVENTUROUS ACTIVITIES PROGRAM', 65, y);

    y += 8;
    doc.setFontSize(16).setTextColor(255, 0, 0).text(title, 67, y);

    y += 8;
    doc.setTextColor('black').setFillColor('white').text('Assessment of Proficiency', 86, y).setFont('helvetica');
    return y;
  }

  headings(doc: jsPDF) {
    this.page++;
    const header = this.group?.books.safe?.heading || this.group?.name + ' Safe Participant Workbook';
    const footer = this.group?.books.safe?.footing || this.group?.name + ' Safe Participant Workbook';

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

    doc.text('Who instructed or assisted you in your activity course and to complete the workbook', start, y);

    y += 4;

    doc.setDrawColor(0);

    [start, start + box, start + box + box].forEach(x => {
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
      [start, start + box, start + box + box].forEach(x => {
        doc.rect(x, y, 50, 10, 'FD');
      });
      y += 10;
    });

    y += 10;

    doc
      .setTextColor(255, 3, 62)
      .text(' Youth Program - Outdoor Adventure Skills are to be recorded in Scouts Terrain', 105, y, { align: 'center' })
      .text('Core Skills Trained Participant - Assessment of Proficiency', 105, y + 8, { align: 'center' })
      .setTextColor(0, 0, 0)
      .setFont('helvetica');

    y += 5;

    ['Name', 'Qualification & Number', 'Date', 'Signature'].forEach(t => {
      y += 10;
      doc
        .setFillColor(204, 204, 204)
        .rect(start, y, box + 10, 10, 'FD')
        .setFillColor('white')
        .rect(start + box + 10, y, box + box - 10, 10, 'FD')
        .text(t, start + 3, y + 6);
    });

    y += 20;

    doc
      .setFontSize(10)
      .text('I certify that proficiency in Core Skills-Trained Participant has been attained by:', start, y)
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
    ].forEach(data => {
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
