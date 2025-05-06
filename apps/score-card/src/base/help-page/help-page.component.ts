import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { saveAs } from 'file-saver';
import { CollapseComponent } from '../../utils';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-help-page',
  imports: [CollapseComponent, MatButton],
  templateUrl: './help-page.component.html',
  styleUrl: './help-page.component.css',
})
export class HelpPageComponent {
  constructor(private http: HttpClient) {}

  getLog() {
    this.http.get('/Adventurous activities Log Book Template Scouts.xlsx', { responseType: 'blob' }).subscribe(blob => {
      saveAs(blob, 'Adventurous activities Log Book Template Scouts.xlsx');
    });
  }
}
