import { Component } from '@angular/core'

@Component({
    templateUrl: './pricing.component.html'
})

export class PricingComponent {

    plans:string = "monthly"

    duration:string = "month";
  
    feesBasic: number = 18;
    feesStandard: number = 15;
  
    planChange() {
        if (this.plans == 'annually') {
            this.feesBasic = 180;
            this.feesStandard = 144;
            this.duration = 'year';
        } else  {
            this.feesBasic = 18;
            this.feesStandard = 15;
            this.duration = 'month';
        }
    }
}        