import { AfterViewChecked, ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ElectronService } from '../core/services';
import { DbService } from '../core/services';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { NewProfilesComponent } from '../new-profiles/new-profiles.component';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { NewOrgComponent } from '../new-org/new-org.component';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  host:{'style':'width:100%'},
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', visibility: 'collapse' })),
      state('expanded', style({ height: '*', visibility: 'visible' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HomeComponent implements OnInit, AfterViewChecked {

  dataSource: MatTableDataSource<any>;
  displayedColumns: string[] = ['position', 'name', 'actions'];
  expandedElement: any | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('table') table: MatTable<any>;


  constructor(public dialog: MatDialog,   private cdRef: ChangeDetectorRef,
              private dbService: DbService,
              private electronService: ElectronService) { }
  
  
  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();
  }

  ngAfterViewInit(): void {
    // this.dataSource.paginator = this.paginator;

    const orgs = this.dbService.getOrgs();
    
    this.dataSource.data = orgs;
    // this.dataSource.sort = this.sort;
  }

  launch(org): void {
    this.electronService.launch(org.name);
  }

  launchProfile(org, profile): void {
    this.electronService.launch(org.name, profile);
  }

  deleteProfile(org, profile) : void{
    this.dbService.delete(org.name, profile);
  }

  reinstall(element): void {
    this.electronService.install(element.name, element.profiles);
  }

  add_new_profile(org): void {
    const dialogRef = this.dialog.open(NewProfilesComponent, {
      width: '500px',
      data: org
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      const new_profiles = result.map(res => res.value).map(p => {
        return {
          name: p.Name,
          login: p.Username,
          pwd: "Salesforce1"
        };
      });

      this.dbService.newProfiles(org.name, new_profiles);

      console.log('The dialog was closed');
    });
    // this.electronService.install(element.name, element.profiles[0])
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  dropTable(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.dataSource.data, event.previousIndex, event.currentIndex);
    this.table.renderRows();    
    // this.cdRef.detectChanges();
  }
}

