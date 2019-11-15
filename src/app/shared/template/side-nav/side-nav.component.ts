import { Component } from '@angular/core';
import { ROUTES } from './side-nav-routes.config';
import { ThemeConstantService } from '../../services/theme-constant.service';

@Component({
    selector: 'app-sidenav',
    templateUrl: './side-nav.component.html'
})

export class SideNavComponent {

    menuItems = [
        {
            path: '/gettingstarted',
            title: 'Getting Started',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'exclamation-circle',
            active: 'true',
        },
        {
            path: '/dashboard',
            title: 'Dashboard',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'dashboard',
            active: 'false',
        },
        {
            path: '/myteam',
            title: 'My Team',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'team',
            active: 'false',
        },
        {
            path: '/mytrainings',
            title: 'My Trainings',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'solution',
            active: 'false',
        },
        {
            path: '/admin',
            title: 'Admin',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'control',
            active: 'false',
        },
        {
            path: '/pricing',
            title: 'Pricing',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'dollar',
            active: 'false',
        }
        /*
        {
            path: '/trainings',
            title: 'Trainings',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'book',
            active: 'false',
        },
        {
            path: '/users',
            title: 'Users',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'team',
            active: 'false',
        },
        {
            path: '/jobs',
            title: 'Jobs',
            submenu: [],
            iconSource: 'ngZorro',
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'book',
            active: 'false',
        },
        {
            path: '/messages',
            title: 'Messages',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'mail',
            active: 'false',
        },
        {
            path: '/notifications',
            title: 'Notifications',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'bell',
            active: 'false',
        },
        {
            path: '/settings',
            title: 'Settings',
            submenu: [],
            iconType: 'nzIcon',
            iconTheme: 'outline',
            iconColor: '',
            icon: 'control',
            active: 'false',
        },
        */
    ];

    themeImageWidth = 150;
    isFolded: boolean;
    isSideNavDark: boolean;

    constructor(private themeService: ThemeConstantService) { }

    ngOnInit(): void {
        this.themeService.isMenuFoldedChanges.subscribe(isFolded => this.isFolded = isFolded);
        this.themeService.isSideNavDarkChanges.subscribe(isDark => this.isSideNavDark = isDark);
    }
}
