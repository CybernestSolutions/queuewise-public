import { Component } from '@angular/core';
import { COMPANY_NAME, NEXT } from '../utilities/const/main';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent {
  companyName = COMPANY_NAME;
  next = NEXT;
  binanLogoImg = '../../assets/images/binan-logo.png';
  bploLogoImg = '../../assets/images/bplo-logo.png';
  backgroundImg = '../../assets/images/background.png';

}
