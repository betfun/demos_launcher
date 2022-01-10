import { State, Action, StateContext } from '@ngxs/store';
import { OrgDelete, OrgLaunchChrome, OrgSave, OrgsLoadAll } from './actions';
import { OrgsStateModel, org_model } from './model';
import { DbService, ElectronService } from '../../core/services';
import { Injectable } from '@angular/core';
import { patch, removeItem } from '@ngxs/store/operators';

@State<OrgsStateModel>({
  name: 'orgs',
  defaults: {
    // version: 2,
    orgs: []
  }
})
@Injectable({ providedIn: "root" })
export class OrgsState {

  constructor(private service: ElectronService, private db: DbService) { }

  @Action(OrgsLoadAll)
  getOrgs(ctx: StateContext<OrgsStateModel>): any {
    const orgs = this.db.getOrgs();
    const stateModel = ctx.getState();

    stateModel.orgs = orgs;
    ctx.setState(stateModel);
  }

  @Action(OrgLaunchChrome)
  public launch(ctx: StateContext<OrgsStateModel>, { payload }: OrgLaunchChrome): void {
    const stateModel = ctx.getState();

    stateModel.orgs.find(payload.org_name);

    this.service.launch(payload.org_name, {
      headless: false,
      use_homepage: true,
      profile: payload.profile
    });

    // stateModel.items = [...stateModel.items, payload];
    ctx.setState(stateModel);
  }

  @Action(OrgSave)
  public org_save(ctx: StateContext<OrgsStateModel>, { payload }: OrgSave): void {

    const stateModel = ctx.getState();

    stateModel.orgs = [payload, ...stateModel.orgs];

    const out = this.db
      .newOrg(payload);

    console.log(out);

    ctx.setState(stateModel);
  }

  @Action(OrgDelete)
  public org_delete(ctx: StateContext<OrgsStateModel>, { name }: OrgDelete): void {

    const removed = this.db.delete_org(name);

    ctx.setState(
      patch({
        orgs: removeItem<org_model>((org) => org.name === removed.name),
      })
    );
  }
}
