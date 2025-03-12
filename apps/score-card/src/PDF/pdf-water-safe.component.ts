import { AsyncPipe } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import jsPDF from 'jspdf';
import { Observable, Subscription } from 'rxjs';
import { User } from '../definitions';
import { UsersService } from '../service/users.service';
import { PdfUserComponent } from './pdf-user.component';

@Component({
  selector: 'app-pdf-water-safe',
  imports: [PdfUserComponent, AsyncPipe],
  templateUrl: './pdf-water-safe.component.html',
  styleUrl: './pdf-water-safe.component.css',
})
export class PdfWaterSafeComponent implements OnDestroy {
  user$: Observable<User | undefined>;

  user?: User;

  subs: Subscription[] = [];

  constructor(userService: UsersService) {
    this.user$ = userService.currentUser$;
    this.subs.push(this.user$.subscribe((u) => (this.user = u)));
  }

  ngOnDestroy(): void {
    this.subs.forEach((x) => x.unsubscribe());
  }

  async print() {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    //. console.log(doc.getFontList());

    const title = 'Paddling Flat Water - Safe Participant';

    let y = this.createTitle(doc, 0, title);

    y = this.instructions(y, doc, title);

    y = this.createUserBox(doc, y);

    y = this.verifiers(doc, y);

    doc.addPage('a4', 'portrait');

    console.log(y);

    doc.save('water-safe-workbook.pdf');
  }

  private instructions(y: number, doc: jsPDF, title: string) {
    const bullet = 43;
    const textLocation = 50;

    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(
      'This proficiency document is for use in the completion for the Scouts Australia requirements of',
      105,
      y,
      { align: 'center' }
    );
    y += 7;
    doc.text(title, 105, y, { align: 'center' });
    y += 7;
    doc.setFont('helvetica');
    this.bullet(doc, bullet, y);
    doc.text(
      'This document can be used as supporting evidence in the Outdoor Adventure Skills (OAS) Stage 5 Paddling',
      textLocation,
      y,
      { maxWidth: 135 }
    );
    y += 5; // extra line
    y += 7;
    this.bullet(doc, bullet, y);
    doc.text(
      'This document is aligned to the following units and can be used as partial evidence towards the Unit of Competency - SISOCNE001 Paddle a craft using fundamental skills',
      textLocation,
      y,
      { maxWidth: 135 }
    );
    y += 10; // two additional lines
    return y;
  }

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

  verifiers(doc: jsPDF, y: number): number {
    y += 10;

    const box = 50;
    const start = 30;
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

    doc.setFont('helvetica');
    return y;
  }

  bullet(doc: jsPDF, x: number, y: number) {
    doc.setFont('Zapfdingbats', 'normal');
    doc.text('l', x, y);
    doc.setFont('helvetica');
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
