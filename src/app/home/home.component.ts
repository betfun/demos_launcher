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
import { org_model, profile_model } from '../store/orgs/model';
import { Router } from '@angular/router';
import { OrgKillChrome, OrgLaunchChrome } from '../store/chrome/actions';

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
  dataSource: MatTableDataSource<org_model>;
  displayedColumns: string[] = ['position', 'id', 'name', 'actions'];
  expandedElement: any | null;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private clipboard: Clipboard,
    private store: Store
  ) { }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();

    this.store.select<org_model[]>(s => s.orgs.orgs)
      .subscribe(orgs => {
        this.dataSource.data = [...orgs];
      });
  }

  launch(org): void {
    this.store.dispatch(new OrgLaunchChrome(org, null));
  }

  launchProfile(org, profile: profile_model): void {
    this.store.dispatch(new OrgLaunchChrome(org, profile));
  }

  deleteOrg(org: org_model): void {
    this.store.dispatch(new OrgDelete(org.name));
  }

  copyProfile(profile: { login: string; pwd: string }): void {
    const copy = `login: ${profile.login} \n pwd: ${profile.pwd}`;
    this.clipboard.copy(copy);
  }

  kill(element: org_model): void {
    this.store.dispatch(new OrgKillChrome(element));
  }

  editOrg(org): void {
    this.router.navigate(['/edit', org.id]);
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
