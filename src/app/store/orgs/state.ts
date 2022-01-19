import { State, Action, StateContext } from '@ngxs/store';
import { OrgDelete, OrgLaunchChrome, OrgSave, OrgsLoadAll } from './actions';
import { OrgsStateModel, org_model } from './model';
import { DbService, ElectronService } from '../../core/services';
import { Injectable } from '@angular/core';
import { insertItem, patch, removeItem, updateItem } from '@ngxs/store/operators';

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
    let orgs = this.db.getOrgs();

    if (orgs === undefined) {
      orgs = [];
    }

    ctx.setState(patch({
      orgs: orgs
    }));

    // const stateModel = ctx.getState()z;

    // stateModel.orgs = orgs;
    // ctx.setState(stateModel);
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

    const org_idx = stateModel.orgs.findIndex(org => org.name === payload.name);
    if (org_idx === -1) {
      ctx.setState(patch({
        orgs: insertItem<org_model>(payload)
      }));
    }
    else {
      ctx.setState(patch({
        orgs: updateItem<org_model>(o => o.name === payload.name, payload)
      }));
    }

    this.db.save(stateModel.orgs);
  }

  @Action(OrgDelete)
  public org_delete(ctx: StateContext<OrgsStateModel>, { name }: OrgDelete): void {

    const stateModel = ctx.setState(
      patch({
        orgs: removeItem<org_model>((org) => org.name === name),
      })
    );

    // const stateModel = ctx.getState();

    this.db.save(stateModel.orgs);
  }
}
