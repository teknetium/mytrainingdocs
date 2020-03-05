import { Component, OnInit, AfterViewInit, NgZone} from '@angular/core';
import { AuthService } from '../../shared/services/auth.service';
import { UserService } from '../../shared/services/user.service';
import { TrainingService } from '../../shared/services/training.service';
import { EventService } from '../../shared/services/event.service';
import { Observable, Subscription } from 'rxjs';
import { UserModel } from '../../shared/interfaces/user.type';
import { EventModel } from '../../shared/interfaces/event.type';
import { TrainingViewerComponent } from '../trainings/training-viewer/training-viewer.component';
import { take } from 'rxjs/operators';
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

  authenticatedUser: UserModel;
  authenticatedUser$: Observable<UserModel>;
  myTeamCnt$: Observable<number>;
  showNewUserModal = false;
  currentTab = 'gettingStarted';
  private chart: am4charts.XYChart;

  constructor(private auth: AuthService,
    private userService: UserService,
    private zone: NgZone,
    private trainingService: TrainingService,
    private eventService: EventService) {
    this.authenticatedUser$ = userService.getAuthenticatedUserStream();
    this.myTeamCnt$ = this.userService.getMyTeamCntStream();
  }

  ngOnInit() {
    this.authenticatedUser$.pipe(take(2)).subscribe(user => {
      if (!user) {
        console.log('home:init:authenticatedUser$.subscribe', user);
        return;
      }

      this.authenticatedUser = user;
      if (this.authenticatedUser.userType !== 'supervisor') {
        this.userService.selectAuthenticatedUser();
      }
    })
  }


  ngAfterViewInit() {
    this.zone.runOutsideAngular(() => {
      let chart = am4core.create("chartdiv", am4charts.XYChart);

      chart.paddingRight = 20;

      let data = [];
      let visits = 10;
      for (let i = 1; i < 366; i++) {
        visits += Math.round((Math.random() < 0.5 ? 1 : -1) * Math.random() * 10);
        data.push({ date: new Date(2018, 0, i), name: "name" + i, value: visits });
      }

      chart.data = data;

      let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
      dateAxis.renderer.grid.template.location = 0;

      let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      valueAxis.tooltip.disabled = true;
      valueAxis.renderer.minWidth = 35;

      let series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.dateX = "date";
      series.dataFields.valueY = "value";

      series.tooltipText = "{valueY.value}";
      chart.cursor = new am4charts.XYCursor();

      let scrollbarX = new am4charts.XYChartScrollbar();
      scrollbarX.series.push(series);
      chart.scrollbarX = scrollbarX;

      this.chart = chart;
    });
  }
  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.chart) {
        this.chart.dispose();
      }
    });
  }

  setCurrentTab(tabName) {
    this.currentTab = tabName;
  }
}
