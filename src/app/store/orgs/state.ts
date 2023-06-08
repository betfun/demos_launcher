import { State, Action, StateContext, Store, NgxsOnInit, Actions, ofActionSuccessful, ActionType } from '@ngxs/store';
import { OrgDelete, OrgSave, OrgsLoadAll, OrgsReorder, UpdateOrgInfos } from './actions';
import { OrgsStateModel, OrgModel } from './model';
import { DbService } from '../../core/services';
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
export class OrgsState implements NgxsOnInit {

  constructor(private store: Store, private actions$: Actions) { }

  @Action(OrgsLoadAll)
  loadAll(ctx: StateContext<OrgsStateModel>): void {
    ctx.setState(patch({ orgs: DbService.getOrgs() }));
  }

  @Action(UpdateOrgInfos)
  update(ctx: StateContext<OrgsStateModel>, { id, info }: UpdateOrgInfos): void {
    const stateModel = ctx.getState();

    const org = stateModel.orgs.find(o => o.id === id);
    org.info = {
      status: info.status,
      expiryDate: info.expiryDate
    };

    patch({ orgs: updateItem<OrgModel>(o => o.id === id, org) });
  }

  @Action(OrgSave)
  save(ctx: StateContext<OrgsStateModel>, { payload }: OrgSave): void {

    const stateModel = ctx.getState();

    const idx = stateModel.orgs.findIndex(org => org.id === payload.id);

    ctx.setState((idx === -1) ?
      patch({ orgs: insertItem<OrgModel>(payload) }) :
      patch({ orgs: updateItem<OrgModel>(o => o.id === payload.id, payload) }));
  }

  @Action(OrgDelete)
  delete(ctx: StateContext<OrgsStateModel>, { org }: OrgDelete): void {

    ctx.setState(patch<OrgsStateModel>({
      orgs: removeItem<OrgModel>((o) => o.id === org.id || o.name === org.name)
    }));
  }

  @Action(OrgsReorder)
  reorder(ctx: StateContext<OrgsStateModel>, { updatedList }: OrgsReorder): void {
    ctx.setState(patch<OrgsStateModel>({
      orgs: updatedList
    }));
  }

  ngxsOnInit(ctx?: StateContext<OrgsStateModel>) {
    this.loadAll(ctx);

    const syncedTypes: ActionType[] = [OrgDelete, OrgSave];
    this.actions$
      .pipe(ofActionSuccessful(...syncedTypes))
      .subscribe(_ => {
        // const userId = this.store.selectSnapshot(AuthState.userId);
        const orgs = ctx.getState().orgs;
        DbService.save(orgs);
      });
  }
}
