import { State, Action, StateContext } from '@ngxs/store';
import { OrgDelete, OrgSave, OrgsLoadAll, OrgsReorder } from './actions';
import { OrgsStateModel, OrgModel, ProfileModel } from './model';
import { DbService, ElectronService } from '../../core/services';
import { Injectable } from '@angular/core';
import { insertItem, patch, removeItem, updateItem } from '@ngxs/store/operators';

@State<OrgsStateModel>({
  name: 'orgs',
  defaults: {
    version: 2,
    orgs: [],
    loadingMessage: ''
  }
})
@Injectable({ providedIn: 'root' })
export class OrgsState {

  constructor(private service: ElectronService, private db: DbService) { }

  @Action(OrgsLoadAll)
  getOrgs(ctx: StateContext<OrgsStateModel>): any {
    let orgs = this.db.getOrgs();

    if (orgs === undefined || !Array.isArray(orgs)) {
      orgs = [];
    }

    ctx.setState(patch({
      orgs
    }));
  }

  @Action(OrgSave)
  public save(ctx: StateContext<OrgsStateModel>, { payload }: OrgSave): void {

    const stateModel = ctx.getState();

    const idx = stateModel.orgs.findIndex(org => org.id === payload.id);

    ctx.setState((idx === -1) ?
      patch({ orgs: insertItem<OrgModel>(payload) }) :
      patch({ orgs: updateItem<OrgModel>(o => o.id === payload.id, payload) }));

    this.db.save(ctx.getState().orgs);
  }

  @Action(OrgDelete)
  public delete(ctx: StateContext<OrgsStateModel>, { name }: OrgDelete): void {

    ctx.setState(patch<OrgsStateModel>({
      orgs: removeItem<OrgModel>((org) => org.name === name)
    }));

    this.db.save(ctx.getState().orgs);
  }

  @Action(OrgsReorder)
  public reorder(ctx: StateContext<OrgsStateModel>, { updatedList }: OrgsReorder): void {
    // const stateModel = ctx.getState();
    ctx.setState(patch<OrgsStateModel>({
      orgs: updatedList
    }));

    this.db.save(ctx.getState().orgs);
  }
}
