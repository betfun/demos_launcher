import { State, Action, Selector, StateContext } from '@ngxs/store';
import { OrgsAction } from '../../orgs/orgs.actions';

export interface Profile {
  name: string,
  login: string, 
  pwd: string,
  isAdmin: boolean
}

export interface Org {
  name: string,
  date: Date,
  profiles: Profile[]
}

export interface OrgsStateModel {
  orgs: Org[];
}

@State<OrgsStateModel>({
  name: 'orgs',
  defaults: {
    orgs: []
  }
})
export class OrgsState {

  @Selector()
  public static getState(state: OrgsStateModel) {
    return state;
  }

  @Action(OrgsAction)
  public add(ctx: StateContext<OrgsStateModel>, { payload }: OrgsAction) {
    const stateModel = ctx.getState();
    stateModel.items = [...stateModel.items, payload];
    ctx.setState(stateModel);
  }
}
