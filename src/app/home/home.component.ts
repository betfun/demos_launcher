import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Clipboard } from '@angular/cdk/clipboard';
import { Store } from '@ngxs/store';
import { OrgDelete, OrgsReorder } from '../store/orgs/actions';
import { OrgModel, ProfileModel } from '../store/orgs/model';
import { OrgKillChrome, OrgLaunchChrome } from '../store/chrome/actions';
import { ConfirmDialogOptions, ConfirmDialogService } from '../core/componentes/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', maxHeight: '0', visibility: 'collapse' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('collapsed <=> expanded', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class HomeComponent implements OnInit, AfterViewChecked {
  dataSource: MatTableDataSource<OrgModel>;
  displayedColumns: string[] = ['position', 'id', 'name', 'actions'];
  expandedElement: any | null;

  constructor(
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private clipboard: Clipboard,
    private confirmDialog: ConfirmDialogService,
    private store: Store
  ) { }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();

    this.store.select<OrgModel[]>(s => s.orgs.orgs)
      .subscribe(orgs => {
        this.dataSource.data = [...orgs];
      });
  }

  launch(org): void {
    this.store.dispatch(new OrgLaunchChrome(org, null));
  }

  launchProfile(org: OrgModel, profile: ProfileModel): void {
    this.store.dispatch(new OrgLaunchChrome(org, profile));
  }

  deleteOrg(org: OrgModel): void {
    const opts: ConfirmDialogOptions = {
      title: 'Delete Org',
      cancelText: 'No',
      confirmText: 'Yes',
      message: `Are you sure you want to delete org: ${org.name} ? `
    };

    this.confirmDialog.open(opts).then(confirmed => {
      if (confirmed) {
        this.store.dispatch(new OrgDelete(org));
      }
    });
  }

  kill(element: OrgModel): void {
    this.store.dispatch(new OrgKillChrome(element));
  }

  share(org: OrgModel): void {

    let clip = '';
    clip += 'Administrator:\n';
    clip += `${org.administrator.login}\n`;
    clip += `${org.administrator.pwd}\n`;
    clip += `\n`;

    org.profiles.forEach(profile => {
      clip += `${profile.name}\n`;
      clip += `${profile.login}\n`;
      clip += `${profile.pwd}\n\n`;
    });

    let copy = JSON.stringify(org);
    copy = copy.replace(/[\[\]\{\}]+/g, '');
    this.clipboard.copy(clip);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  dropTable(event: CdkDragDrop<any>): void {
    moveItemInArray(
      this.dataSource.data,
      event.previousIndex,
      event.currentIndex
    );

    this.store.dispatch(new OrgsReorder(this.dataSource.data));
  }
}
