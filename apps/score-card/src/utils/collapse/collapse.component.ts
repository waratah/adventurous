import { NgClass } from '@angular/common';
import { Component, input, model } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-collapse',
  imports: [MatIconModule, MatToolbarModule, MatButtonModule, NgClass],
  templateUrl: './collapse.component.html',
  styleUrl: './collapse.component.css',
})
export class CollapseComponent {
  public heading = input<string>();

  public show = model<boolean>(true);
}
