import { Component, Input } from '@angular/core';
import { ThemeConstantService } from '../../shared/services/theme-constant.service';
import { NzContextMenuService, NzDropdownMenuComponent } from 'ng-zorro-antd';
import { FileModel } from '../../shared/interfaces/file.type';
import { Observable, Subscription } from 'rxjs';
import { FileService } from '../../shared/services/file.service';
import { Router } from '@angular/router';


@Component({
    selector: 'app-file-mgr',
    templateUrl: './file-manager.component.html',
    styleUrls: ['./file-manager.component.css'],
})

export class FileManagerComponent {

    files$: Observable<FileModel[]>;
    files: FileModel[] = null;
    selectedFile: FileModel;
    action$: Observable<string>;

    newVersion = {};
    isNewVersionModalVisible = false;

    themeColors = this.colorConfig.get().colors;
    //    selectedFile: string = '';
    selectedFile$: Observable<FileModel>;
    uploadedFile$: Observable<FileModel>;
    selectedFileIndex = -1;
    selectedFileIndex$: Observable<number>;
    listView: boolean = false;
    isDetailsOpen: boolean = false;
    isNavOpen: boolean = false;
    isVisible: boolean = false;
    viewTitle: string = 'Redirect to Admin Page?';
    docUrl$: Observable<string>;
    view: string = 'cardView';

    colorRed = this.themeColors.red;
    colorBlue = this.themeColors.blue;
    colorCyan = this.themeColors.cyan;
    colorGold = this.themeColors.gold;
    colorVolcano = this.themeColors.volcano;
    colorPurple = this.themeColors.purple;
    colorMagenta = this.themeColors.magenta;
    colorLime = this.themeColors.lime;

    @Input() mode = 'full';

    streamId: string = '';
    sub1: Subscription;
    sub2: Subscription;
    sub3: Subscription;

    constructor(
        private colorConfig: ThemeConstantService,
        private fileService: FileService,
        private router: Router,
        private nzContextMenuService: NzContextMenuService) {
    }

    ngOnInit(): void {
        this.streamId = String(new Date().getTime());
        this.files$ = this.fileService.getFilesStream();
//        this.fileService.setupPrivateDocumentStream(this.streamId);
        this.fileService.setupPrivateSelectedFileStream(this.streamId);
        this.fileService.setupPrivateSelectedFileIndexStream(this.streamId)
        this.selectedFile$ = this.fileService.getSelectedFileStream();
        this.selectedFileIndex$ = this.fileService.getSelectedFileIndexStream();
        this.uploadedFile$ = this.fileService.getUploadedFileStream();
        this.files$.subscribe(files => {
            if (!files) {
                return;
            }
            this.files = files;
//            this.fileService.selectItem(0, this.streamId);
        });
        this.selectedFile$.subscribe(file => {
            if (!file) {
                return;
            }
            this.selectedFile = file;
        });

        this.uploadedFile$.subscribe(file => {
            if (file) {
                this.fileService.selectItemById(file._id, this.streamId);
            }
        });
/*
        this.action$.subscribe(action => {
            if (action === 'init') {
                this.fileService.selectItem(0, this.streamId);
            } else if (action === 'newFile') {
                this.fileService.selectItem(, this.streamId);
            }
            }
        })
        */
    }

    changeView() {
        this.listView = !this.listView;
    }
/*
    contextMenu($event: MouseEvent, contextDropdownTpl: NzDropdownMenuComponent, selected: string): void {
        this.nzContextMenuService.create($event, contextDropdownTpl);
        //        this.selectedFile = selected;
        this.isDetailsOpen = true;
    }
    */

    selectFile(event: any, i: number) {
        if (this.selectedFileIndex === i) {
            this.selectedFileIndex = -1;
//            this.fileService.selectItem(-1, this.streamId);
        } else {
            this.selectedFileIndex = i;
            this.selectedFile = this.files[this.selectedFileIndex];
        }
//        this.fileService.selectItem(this.selectedFileIndex, this.streamId);
    }

    close(): void {
        this.nzContextMenuService.close();
    }

    closeContentDetails() {
        this.isDetailsOpen = false;
    }

    openPicker(e: any) {
        e.preventDefault();
        e.stopPropagation();
        this.fileService.openDocPicker();
    }

    addNewVersion() {

    }

    saveFile() {
        this.fileService.saveFile(this.selectedFile);
    }

    uploadNewVersion() {
        this.newVersion = {
            version: '',
            changeLog: '',
            owner: '',
            fsHandle: '',
            url: '',
            dateUploaded: 0
        };

        this.isNewVersionModalVisible = true;
    }

    deleteFile(id) {
        this.fileService.deleteFile(id);
        this.selectedFileIndex = -1;
    }

    navToggler() {
        this.isNavOpen = !this.isNavOpen;
    }

    dismissModal() {
        this.isVisible = false;
    }
}