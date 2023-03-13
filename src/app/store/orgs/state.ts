import { State, Action, StateContext, Store, NgxsOnInit, NgxsOnChanges, NgxsSimpleChange, NgxsExecutionStrategy, Actions, ofActionSuccessful, ActionType } from '@ngxs/store';
import { OrgDelete, OrgSave, OrgsLoadAll, OrgsMigration, OrgsReorder, OrgsUnload } from './actions';
import { OrgsStateModel, OrgModel, ProfileModel } from './model';
import { DbService, ElectronService } from '../../core/services';
import { Injectable } from '@angular/core';
import { insertItem, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AuthState } from '../auth/auth.state';
import firebase from 'firebase/compat';

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

  constructor(private fire: AngularFirestore, private store: Store, private actions$: Actions) { }

  @Action(OrgsMigration)
  migrate({ setState }: StateContext<OrgsStateModel>): void {

    const oldOrgs = DbService.getOrgs();

    setState(patch({ orgs: oldOrgs }));
  }

  @Action(OrgsUnload)
  public unloadAll(ctx: StateContext<OrgsStateModel>): void {
    ctx.setState(patch({ orgs: [] as OrgModel[] }));
  }

  @Action(OrgsLoadAll)
  loadAll(ctx: StateContext<OrgsStateModel>, { }: OrgsLoadAll): void {

    const userId = this.store.selectSnapshot(AuthState.userId);

    if (userId === undefined) {
      ctx.setState(patch({ orgs: [] as OrgModel[] }));
    }
    else {
      this.fire.collection('Users').doc<{ orgs: OrgModel[] }>(userId).get().subscribe(l => {
        ctx.setState(patch({ orgs: l.data().orgs }));
      });
    }
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
  delete(ctx: StateContext<OrgsStateModel>, { name }: OrgDelete): void {

    ctx.setState(patch<OrgsStateModel>({
      orgs: removeItem<OrgModel>((org) => org.name === name)
    }));
  }

  @Action(OrgsReorder)
  reorder(ctx: StateContext<OrgsStateModel>, { updatedList }: OrgsReorder): void {
    ctx.setState(patch<OrgsStateModel>({
      orgs: updatedList
    }));
  }

  ngxsOnInit(ctx?: StateContext<OrgsStateModel>) {
    this.store.select(AuthState.userId).subscribe(userId => {
      const action = userId ? new OrgsLoadAll() : new OrgsUnload();
      ctx.dispatch(action);
    });

    const syncedTypes: ActionType[] = [OrgDelete, OrgsMigration, OrgSave];
    this.actions$
      .pipe(ofActionSuccessful(...syncedTypes))
      .subscribe(_ => {
        const userId = this.store.selectSnapshot(AuthState.userId);
        this.fire.collection('Users').doc(userId).update({ orgs: ctx.getState() });
      });
  }
}
