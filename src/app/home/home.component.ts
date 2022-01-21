import {
  AfterViewChecked,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTable, MatTableDataSource } from "@angular/material/table";
import { MatDialog } from "@angular/material/dialog";
import { ElectronService } from "../core/services";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { NewProfilesComponent } from "../new-profiles/new-profiles.component";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";
import { Clipboard } from "@angular/cdk/clipboard";
import { Store } from "@ngxs/store";
import { OrgDelete, OrgDeleteProfile, OrgSave, OrgsInstallChrome, OrgsLoadAll } from "../store/orgs/actions";
import { org_model, profile_model } from "../store/orgs/model";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
  host: { style: "width:100%" },
  // changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger("detailExpand", [
      state(
        "collapsed",
        style({ height: "0px", minHeight: "0", visibility: "collapse" })
      ),
      state("expanded", style({ height: "*", visibility: "visible" })),
      transition(
        "expanded <=> collapsed",
        animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)")
      ),
    ]),
  ],
})
export class HomeComponent implements OnInit, AfterViewChecked {
  dataSource: MatTableDataSource<org_model>;
  displayedColumns: string[] = ["position", "name", "actions"];
  expandedElement: any | null;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild("table") table: MatTable<any>;

  constructor(
    public dialog: MatDialog,
    private cdRef: ChangeDetectorRef,
    private clipboard: Clipboard,
    private electronService: ElectronService,
    private store: Store
  ) { }

  // @Select(state => state.orgs.orgs) orgs$: Observable<Org[]>;

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource();

    this.store.select<org_model[]>(state => state.orgs.orgs)
      .subscribe(orgs => {
        this.dataSource.data = orgs;
      });
  }

  ngAfterViewInit(): void {
    // this.dataSource.paginator = this.paginator;
    this.store.dispatch(new OrgsLoadAll());
  }

  launch(org): void {
    this.electronService.launch(org.name);
  }

  launchProfile(org, profile: profile_model): void {
    this.electronService.launch(org.name, { profile: profile, headless: false, use_homepage: true });
  }

  deleteProfile(org, profile): void {
    this.store.dispatch(new OrgDeleteProfile(org.name, profile));
  }

  deleteOrg(org) : void {
    this.store.dispatch(new OrgDelete(org.name));
  }

  reinstall(element): void {
    this.store.dispatch(new OrgsInstallChrome(element.name, element.profiles));
    //  this.electronService.install(element.name, element.profiles);
  }

  copyProfile(profile: { login: string; pwd: string; }): void {
    console.log(profile);
    const copy = `login: ${profile.login} \n pwd: ${profile.pwd}`;
    this.clipboard.copy(copy);
  }

  kill(element): void {
    this.electronService.kill(element.name);
  }

  add_new_profile(org): void {
    const dialogRef = this.dialog.open(NewProfilesComponent, {
      width: "650px",
      data: org,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === undefined || result === null) return;
      this.store.dispatch(new OrgSave(result));
    });
    // this.electronService.install(element.name, element.profiles[0])
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  dropTable(event: CdkDragDrop<any[]>): void {
    moveItemInArray(
      this.dataSource.data,
      event.previousIndex,
      event.currentIndex
    );
    this.table.renderRows();
    // this.cdRef.detectChanges();
  }
}
