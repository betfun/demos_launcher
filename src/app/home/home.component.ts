import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ElectronService } from '../core/services';
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
import { OrgDelete, OrgDeleteProfile, OrgSave, OrgsInstallChrome, OrgsLoadAll, OrgsReorder } from '../store/orgs/actions';
import { org_model, profile_model } from '../store/orgs/model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed, void', style({ height: '0px', maxHeight: '0', visibility: 'collapse' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      // transition("* => void", state("collapsed")),
      transition('collapsed <=> expanded', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
      transition('expanded <=> void', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ]),
  ],
})
export class HomeComponent implements OnInit, AfterViewChecked {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;

  dataSource: MatTableDataSource<org_model>;
  displayedColumns: string[] = ['position', 'id', 'name', 'actions'];
  expandedElement: any | null;

  constructor(
    private router: Router,
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private clipboard: Clipboard,
    private electronService: ElectronService,
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
    this.electronService.launch(org.name);
  }

  launchProfile(org, profile: profile_model): void {
    this.electronService.launch(org.name, { profile, headless: false, useHomepage: true });
  }

  deleteProfile(org, profile): void {
    this.store.dispatch(new OrgDeleteProfile(org.name, profile));
  }

  deleteOrg(org: org_model): void {
    this.store.dispatch(new OrgDelete(org.name));
  }

  reinstall(element: org_model): void {
    this.store.dispatch(new OrgsInstallChrome(element as org_model));
  }

  copyProfile(profile: { login: string; pwd: string }): void {
    console.log(profile);
    const copy = `login: ${profile.login} \n pwd: ${profile.pwd}`;
    this.clipboard.copy(copy);
  }

  kill(element): void {
    this.electronService.kill(element.name);
  }

  addNewProfiles(org): void {
    console.log(org);
    this.router.navigate(['/edit', org.id]);

    // const dialogRef = this.dialog.open(NewProfilesComponent, {
    //   width: '650px',
    //   data: org,
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (result === undefined || result === null) {return;}
    //   this.store.dispatch(new OrgSave(result));
    // });
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
